import Web3 from "web3";
import dotenv from "dotenv";
import fs from "fs";

// Check if .env.local exists and load it, otherwise load .env from the sibling private_html directory
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config({ path: "../private_html/.env" });
}

import {
  atiasBlessingAbi,
  axieAccessoryTokenAbi,
  axieAscendAbi,
  axieInfinityAbi,
  axsTokenAbi,
  charmTokenAbi,
  consumableTokenAbi,
  landItemTokenAbi,
  landTokenAbi,
  materialAbi,
  partEvolutionAbi,
  // ABIs
  roninGatewayAbi,
  runeTokenAbi,
  wethTokenAbi,
} from "./abis";

import {
  // Supabase logic
  getMetaValue,
  setMetaValue,
  upsertBlock,
  upsertGatewayTransaction,
  upsertTransaction,
} from "./supabase";

import {
  // Gateway topics
  depositedTopic,
  withdrawalRequestedTopic,
} from "./topics";

import {
  // Types
  GatewayTransaction,
  NftTransfer,
  Transaction,
} from "./types";

import {
  // Utils
  decodeLogs,
  fetchBlockTimestamp,
  fetchLogsForBlockRange,
  getNftType,
} from "./utils";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Kick up the max execution time

const web3 = new Web3(process.env.RONIN_API_ENDPOINT);
const blockTimestampCache: Record<string, string> = {};

// Simple cache helper to avoid extra block timestamp lookups
const fetchCachedBlockTimestamp = async (blockNumber: string) => {
  if (blockTimestampCache[blockNumber]) {
    return blockTimestampCache[blockNumber];
  }
  const timestamp = await fetchBlockTimestamp(blockNumber);
  blockTimestampCache[blockNumber] = timestamp;
  return timestamp;
};

const requiredEnvVars = [
  "RONIN_API_ENDPOINT",
  "RONIN_GATEWAY_ADDRESS",
  "WETH_TOKEN_CONTRACT_ADDRESS",
  "ATIAS_BLESSING_CONTRACT_ADDRESS",
  "AXIE_ACCESSORY_TOKEN_CONTRACT_ADDRESS",
  "AXS_TOKEN_CONTRACT_ADDRESS",
  "AXIE_ASCEND_CONTRACT_ADDRESS",
  "AXIE_TOKEN_CONTRACT_ADDRESS",
  "LAND_TOKEN_CONTRACT_ADDRESS",
  "LAND_ITEM_TOKEN_CONTRACT_ADDRESS",
  "MATERIAL_TOKEN_CONTRACT_ADDRESS",
  "RUNE_TOKEN_CONTRACT_ADDRESS",
  "CHARM_TOKEN_CONTRACT_ADDRESS",
  "PART_EVOLUTION_CONTRACT_ADDRESS",
  "CONSUMABLE_ITEM_TOKEN_ADDRESS",
  "COMMUNITY_TREASURY_ADDRESS",
  "MARKETPLACE_CONTRACT_ADDRESS",
  "PORTAL_CONTRACT_ADDRESS",
  "RONIN_GATEWAY_FIRST_REAL_TX_BLOCK",
];

const checkEnvVars = () => {
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.error(`Error: Environment variable ${varName} is not defined.`);
      process.exit(1);
    }
  }
};

checkEnvVars();

async function fetchTransactions() {
  try {
    let fromBlockStr;
    let toBlockStr;

    // 1. Determine block range
    const lastBlockStr = await getMetaValue("last_processed_block");
    let fromBlockFallback = process.env.RONIN_GATEWAY_FIRST_REAL_TX_BLOCK ||
      "0";
    const fromBlockEffective = lastBlockStr ? lastBlockStr : fromBlockFallback;
    if (!fromBlockStr) {
      fromBlockStr = fromBlockEffective;
    }
    if (!toBlockStr) {
      const blockInterval = 3;
      toBlockStr = (parseInt(fromBlockStr, 10) + blockInterval).toString();
    }
    const fromBlock = parseInt(fromBlockStr, 10);
    const toBlock = parseInt(toBlockStr, 10);

    console.log(`Processing block range from ${fromBlock} to ${toBlock}`);

    // 2. Fetch logs for the block range
    const logs = await fetchLogsForBlockRange(fromBlock, toBlock);
    console.log(
      `Fetched ${logs.length} logs for block range ${fromBlock} to ${toBlock}`,
    );
    if (logs.length === 0) {
      const latestBlockNumber = await web3.eth.getBlockNumber();
      if (toBlock < latestBlockNumber) {
        await setMetaValue("last_processed_block", toBlock.toString());
      }
      console.log("No logs found");
      return;
    }

    // 3. Decode bridging logs
    const gatewayAddress = process.env.RONIN_GATEWAY_ADDRESS!.toLowerCase();
    const wethAddress = process.env.WETH_TOKEN_CONTRACT_ADDRESS!.toLowerCase();
    const bridgingLogs = logs.filter(
      (log: any) =>
        log.address === gatewayAddress || log.address === wethAddress,
    );

    const decodedWethLogs = decodeLogs(
      bridgingLogs.filter((log: any) => log.address === wethAddress),
      wethTokenAbi,
      web3,
    );
    const decodedDepositedLogs = decodeLogs(
      bridgingLogs.filter((log: any) => log.topics.includes(depositedTopic)),
      roninGatewayAbi,
      web3,
    );
    const decodedWithdrawalRequestedLogs = decodeLogs(
      bridgingLogs.filter((log: any) =>
        log.topics.includes(withdrawalRequestedTopic)
      ),
      roninGatewayAbi,
      web3,
    );

    const combinedBridgeLogs = [
      ...decodedWethLogs,
      ...decodedDepositedLogs,
      ...decodedWithdrawalRequestedLogs,
    ];

    console.log(`Decoded ${combinedBridgeLogs.length} bridging logs`);

    const logsByBridgeTx: Record<string, any[]> = {};
    combinedBridgeLogs.forEach((log) => {
      if (!logsByBridgeTx[log.transactionHash]) {
        logsByBridgeTx[log.transactionHash] = [];
      }
      logsByBridgeTx[log.transactionHash].push(log);
    });

    const bridgingTxs = Object.entries(logsByBridgeTx).filter(
      ([, bLogs]) =>
        bLogs.some((x) => x.event === "Transfer") &&
        bLogs.some((x) =>
          x.event === "Deposited" || x.event === "WithdrawalRequested"
        ),
    );

    for (const [transactionHash, bLogs] of bridgingTxs) {
      const blockHex = bLogs[0].blockNumber;
      const blockNum = parseInt(blockHex, 16);

      await upsertBlock(blockNum); // ensures we have that block in DB

      let type = "unknown";
      let address = "";
      let amount = "0";

      bLogs.forEach((log) => {
        const { event, decodedLog, contractAddress } = log;
        if (event === "Transfer" && contractAddress === wethAddress) {
          const fromAddress = decodedLog._from.toLowerCase();
          const toAddress = decodedLog._to.toLowerCase();
          // Figure out direction
          if (fromAddress === gatewayAddress) {
            address = toAddress;
          } else if (toAddress === gatewayAddress) {
            address = fromAddress;
          }
          amount = decodedLog._value.toString();
        } else if (event === "Deposited") {
          type = "deposit";
        } else if (event === "WithdrawalRequested") {
          type = "withdrawal";
        }
      });

      const newGatewayTx: GatewayTransaction = {
        transaction_id: transactionHash,
        block: blockNum,
        amount,
        type,
        address,
      };
      console.log(
        `Upserting gateway transaction: ${JSON.stringify(newGatewayTx)}`,
      );
      await upsertGatewayTransaction(newGatewayTx);
    }

    // 4. Decode NFT/treasury logs
    const addresses = {
      atia: process.env.ATIAS_BLESSING_CONTRACT_ADDRESS!.toLowerCase(),
      accessory: process.env.AXIE_ACCESSORY_TOKEN_CONTRACT_ADDRESS!
        .toLowerCase(),
      axs: process.env.AXS_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      weth: wethAddress,
      ascend: process.env.AXIE_ASCEND_CONTRACT_ADDRESS!.toLowerCase(),
      axie: process.env.AXIE_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      land: process.env.LAND_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      landItem: process.env.LAND_ITEM_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      material: process.env.MATERIAL_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      rune: process.env.RUNE_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      charm: process.env.CHARM_TOKEN_CONTRACT_ADDRESS!.toLowerCase(),
      evolution: process.env.PART_EVOLUTION_CONTRACT_ADDRESS!.toLowerCase(),
      consumable: process.env.CONSUMABLE_ITEM_TOKEN_ADDRESS!.toLowerCase(),
    };

    const decodedLogs = {
      accessory: decodeLogs(
        logs.filter((log: any) => log.address === addresses.accessory),
        axieAccessoryTokenAbi,
        web3,
      ),
      atia: decodeLogs(
        logs.filter((log: any) => log.address === addresses.atia),
        atiasBlessingAbi,
        web3,
      ),
      axs: decodeLogs(
        logs.filter((log: any) => log.address === addresses.axs),
        axsTokenAbi,
        web3,
      ),
      weth: decodeLogs(
        logs.filter((log: any) => log.address === addresses.weth),
        wethTokenAbi,
        web3,
      ),
      ascend: decodeLogs(
        logs.filter((log: any) => log.address === addresses.ascend),
        axieAscendAbi,
        web3,
      ),
      axie: decodeLogs(
        logs.filter((log: any) => log.address === addresses.axie),
        axieInfinityAbi,
        web3,
      ),
      land: decodeLogs(
        logs.filter((log: any) => log.address === addresses.land),
        landTokenAbi,
        web3,
      ),
      landItem: decodeLogs(
        logs.filter((log: any) => log.address === addresses.landItem),
        landItemTokenAbi,
        web3,
      ),
      material: decodeLogs(
        logs.filter((log: any) => log.address === addresses.material),
        materialAbi,
        web3,
      ),
      rune: decodeLogs(
        logs.filter((log: any) => log.address === addresses.rune),
        runeTokenAbi,
        web3,
      ),
      charm: decodeLogs(
        logs.filter((log: any) => log.address === addresses.charm),
        charmTokenAbi,
        web3,
      ),
      evolution: decodeLogs(
        logs.filter((log: any) => log.address === addresses.evolution),
        partEvolutionAbi,
        web3,
      ),
      consumable: decodeLogs(
        logs.filter((log: any) => log.address === addresses.consumable),
        consumableTokenAbi,
        web3,
      ),
    };

    const combinedNftLogs = [
      ...decodedLogs.accessory,
      ...decodedLogs.atia,
      ...decodedLogs.axs,
      ...decodedLogs.weth,
      ...decodedLogs.ascend,
      ...decodedLogs.axie,
      ...decodedLogs.land,
      ...decodedLogs.landItem,
      ...decodedLogs.material,
      ...decodedLogs.rune,
      ...decodedLogs.charm,
      ...decodedLogs.evolution,
      ...decodedLogs.consumable,
    ];

    console.log(`Decoded ${combinedNftLogs.length} NFT/treasury logs`);

    const logsByTx: Record<string, any[]> = {};
    combinedNftLogs.forEach((log) => {
      if (!logsByTx[log.transactionHash]) {
        logsByTx[log.transactionHash] = [];
      }
      logsByTx[log.transactionHash].push(log);
    });

    const relevantTxs = Object.entries(logsByTx).filter(([_, txLogs]) =>
      txLogs.some(
        (log) =>
          (log.contractAddress === addresses.axs ||
            log.contractAddress === addresses.weth) &&
          log.decodedLog._to?.toLowerCase() ===
            process.env.COMMUNITY_TREASURY_ADDRESS!.toLowerCase(),
      )
    );

    const uniqueBlockNumbers = [
      ...new Set(
        relevantTxs.flatMap(([, txLogs]) => txLogs.map((l) => l.blockNumber)),
      ),
    ];

    const blockTimestamps = await Promise.all(
      uniqueBlockNumbers.map((blockNumberHex) =>
        fetchCachedBlockTimestamp(blockNumberHex)
      ),
    );
    const blockTimestampMap = uniqueBlockNumbers.reduce(
      (acc, blockNumberHex, i) => {
        acc[blockNumberHex] = blockTimestamps[i];
        return acc;
      },
      {} as Record<string, string>,
    );

    for (const [transactionHash, txLogs] of relevantTxs) {
      const blockNumberHex = txLogs[0].blockNumber;
      const blockTimestamp = blockTimestampMap[blockNumberHex];
      const blockNumber = parseInt(blockNumberHex, 16);

      let axsFee = "0";
      let wethFee = "0";
      let transactionSource = "unknown";
      const nftTransfers: NftTransfer[] = [];

      txLogs.forEach((log) => {
        const { event, decodedLog, contractAddress } = log;
        const fromAddress = (decodedLog._from || decodedLog.from)
          ?.toLowerCase();
        const toAddress = (decodedLog._to || decodedLog.to)?.toLowerCase();

        // Determine the transaction source
        if (fromAddress === process.env.MARKETPLACE_CONTRACT_ADDRESS) {
          transactionSource = "marketplace";
        } else if (fromAddress === process.env.PORTAL_CONTRACT_ADDRESS) {
          transactionSource = "portal";
        } else if (event === "PrayerCountSynced") {
          transactionSource = "atiablessing";
        } else if (event === "AxieLevelAscended") {
          transactionSource = "ascend";
        } else if (event === "PartEvolutionCreated") {
          transactionSource = "evolution";
        } else if (event === "AxieSpawn") {
          transactionSource = "breeding";
        }

        // Determine if this transaction contains AXS or WETH fees to the treasury
        if (
          toAddress === process.env.COMMUNITY_TREASURY_ADDRESS!.toLowerCase()
        ) {
          if (contractAddress === addresses.axs) {
            axsFee = decodedLog._value?.toString() || "0";
          } else if (contractAddress === addresses.weth) {
            wethFee = decodedLog._value?.toString() || "0";
          }
        }

        // Determine if this transaction involves an NFT transfer
        if (
          (event === "Transfer" || event === "TransferSingle") && toAddress &&
          fromAddress
        ) {
          const tokenId = decodedLog._tokenId || decodedLog.tokenId ||
            decodedLog.id;
          if (tokenId) {
            nftTransfers.push({
              transaction_id: transactionHash,
              id: tokenId.toString(),
              type: getNftType(contractAddress),
            });
          }
        }
      });

      // Determine final type
      let transactionType = "unknown";
      if (transactionSource === "marketplace") {
        transactionType = "sale";
      } else if (transactionSource === "portal") {
        transactionType = "rc-mint";
      } else if (transactionSource === "ascend") {
        transactionType = "ascension";
      } else if (transactionSource === "breeding") {
        transactionType = "breeding";
      } else if (transactionSource === "evolution") {
        transactionType = "evolution";
      } else if (transactionSource === "atiablessing") {
        transactionType = "atiablessing";
      }

      if (transactionType === "unknown" && nftTransfers.length > 0) {
        transactionType = "sale";
      }

      const newTx: Transaction = {
        transaction_id: transactionHash,
        timestamp: new Date(parseInt(blockTimestamp, 16) * 1000).toISOString(),
        block: blockNumber,
        type: transactionType,
        axs_fee: axsFee,
        weth_fee: wethFee,
      };

      console.log(`Upserting transaction: ${JSON.stringify(newTx)}`);
      await upsertTransaction(newTx, nftTransfers);
    }

    await setMetaValue("last_processed_block", toBlock.toString());
    console.log("Transactions fetched successfully");
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

async function main() {
  while (true) {
    await fetchTransactions();
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3-second delay
  }
}

main();
``;
