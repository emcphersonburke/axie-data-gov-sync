import { AbiItem } from 'web3'

export const marketplaceAbi: AbiItem[] = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bool', name: '', type: 'bool' }],
    name: 'AllowedAllPaymentTokens',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string[]',
        name: 'interfaces',
        type: 'string[]',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'InterfacesUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IKatanaRouter',
        name: 'KatanaRouterContract',
        type: 'address',
      },
    ],
    name: 'KatanaRouterUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'referralFeature',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'contract IMarketCommission',
        name: 'marketCommission',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'autoTransferReferralReward',
        type: 'bool',
      },
    ],
    name: 'MarketCommissionConfigUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minMarketFeePercentage',
        type: 'uint256',
      },
    ],
    name: 'MinMarketFeePercentageUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'tokens',
        type: 'address[]',
      },
      { indexed: false, internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    name: 'PaymentTokensAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: '', type: 'address' },
    ],
    name: 'TreasuryUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IWRON',
        name: 'wronContract',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IWRONHelper',
        name: 'wronHelper',
        type: 'address',
      },
    ],
    name: 'WRONConfigUpdated',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WRON',
    outputs: [{ internalType: 'contract IWRON', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'allowedAllPaymentTokens',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'allowedPaymentToken',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'interfaceName', type: 'string' }],
    name: 'getInterface',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMarketCommissionConfig',
    outputs: [
      { internalType: 'bool', name: 'referralFeature', type: 'bool' },
      {
        internalType: 'contract IMarketCommission',
        name: 'marketCommission',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'autoTransferReferralReward',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'getRoleMember',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleMemberCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IWRON', name: 'wronContract', type: 'address' },
      {
        internalType: 'contract IWRONHelper',
        name: 'wronHelper',
        type: 'address',
      },
      { internalType: 'bool', name: 'allowedAllPaymentTokens', type: 'bool' },
      { internalType: 'bool', name: 'referralFeature', type: 'bool' },
      {
        internalType: 'contract IMarketCommission',
        name: 'marketCommission',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'autoTransferReferralReward',
        type: 'bool',
      },
      { internalType: 'address[]', name: 'paymentTokens', type: 'address[]' },
      { internalType: 'string[]', name: 'interfaces', type: 'string[]' },
      { internalType: 'address[][2]', name: 'addresses', type: 'address[][2]' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'interfaceName', type: 'string' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'interactWith',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bool', name: 'flag', type: 'bool' }],
    name: 'setAllowedAllPaymentTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string[]', name: 'interfaces', type: 'string[]' },
      { internalType: 'address[]', name: 'addresses', type: 'address[]' },
    ],
    name: 'setInterfaces',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IKatanaRouter',
        name: 'routerContract',
        type: 'address',
      },
    ],
    name: 'setKatanaRouter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: 'referralFeature', type: 'bool' },
      {
        internalType: 'contract IMarketCommission',
        name: 'marketCommission',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'autoTransferReferralReward',
        type: 'bool',
      },
    ],
    name: 'setMarketCommissionConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'tokens', type: 'address[]' },
      { internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    name: 'setPaymentTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IWRON', name: 'wronAddr', type: 'address' },
      {
        internalType: 'contract IWRONHelper',
        name: 'wronHelperAddr',
        type: 'address',
      },
    ],
    name: 'setWRONConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wronHelper',
    outputs: [
      { internalType: 'contract IWRONHelper', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
]
