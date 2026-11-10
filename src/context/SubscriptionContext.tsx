import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract'

export interface Plan {
  id: number
  name: string
  price: bigint
  duration: number
  unlocksHistory: boolean
  unlocksMultimodal: boolean
  active: boolean
}

export interface SubscriptionStatus {
  hasHistory: boolean
  historyExpiresAt: number
  hasMultimodal: boolean
  multimodalExpiresAt: number
}

interface SubscriptionContextType {
  account: string | null
  balance: string
  plans: Plan[]
  status: SubscriptionStatus | null
  pendingPlanId: number | null
  isCancelling: boolean
  connecting: boolean
  error: string | null
  connectWallet: () => Promise<void>
  changeWallet: () => Promise<void>
  disconnectWallet: () => void
  subscribe: (planId: number, price: bigint) => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
  refreshStatus: () => Promise<void>
}

const CANDIDATE_ADDRESSES = [
  CONTRACT_ADDRESS,
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
]

async function getDeployedAddress(provider: ethers.JsonRpcProvider): Promise<string | null> {
  for (const addr of CANDIDATE_ADDRESSES) {
    try {
      const code = await provider.getCode(addr)
      if (code && code !== '0x' && code !== '0x0') {
        return addr
      }
    } catch {
    }
  }
  return null
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [plans, setPlans] = useState<Plan[]>([])
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState<boolean>(false)
  const [connecting, setConnecting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContractData = useCallback(async (userAddr: string) => {
    try {
      const directProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
      const targetAddress = await getDeployedAddress(directProvider)
      if (!targetAddress) {
        return
      }

      const readContract = new ethers.Contract(targetAddress, CONTRACT_ABI, directProvider)
      const rawPlans = await readContract.getPlans()
      const parsedPlans: Plan[] = rawPlans.map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        price: p.price,
        duration: Number(p.duration),
        unlocksHistory: p.unlocksHistory,
        unlocksMultimodal: p.unlocksMultimodal,
        active: p.active
      }))
      setPlans(parsedPlans)

      const subStatus = await readContract.getSubscriptionStatus(userAddr)
      setStatus({
        hasHistory: Boolean(subStatus[0]),
        historyExpiresAt: Number(subStatus[1]),
        hasMultimodal: Boolean(subStatus[2]),
        multimodalExpiresAt: Number(subStatus[3])
      })

      const bal = await directProvider.getBalance(userAddr)
      setBalance(Number(ethers.formatEther(bal)).toFixed(4))
    } catch {
    }
  }, [])

  const handleInit = useCallback(async (addr: string) => {
    try {
      setAccount(addr)
      await fetchContractData(addr)
    } catch (err: any) {
      setError(err?.message || 'Помилка завантаження даних контракту')
    }
  }, [fetchContractData])

  async function ensureAnvilChain(): Promise<boolean> {
    const eth = (window as any).ethereum
    if (!eth) return false
    try {
      const chainId = await eth.request({ method: 'eth_chainId' })
      if (chainId === '0x7a69') return true

      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }]
        })
        return true
      } catch (switchErr: any) {
        if (switchErr.code === 4902 || switchErr?.data?.originalError?.code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Anvil Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
              }
            ]
          })
          return true
        }
        return false
      }
    } catch (err: any) {
      console.error(err)
      return false
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum
      const isDisconnected = localStorage.getItem('birdly_wallet_disconnected') === 'true'

      if (!isDisconnected) {
        eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleInit(accounts[0])
          }
        }).catch(() => {})
      }

      const onAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          localStorage.removeItem('birdly_wallet_disconnected')
          handleInit(accounts[0])
        } else {
          disconnectWallet()
        }
      }

      const onChainChanged = () => {
        if (account) {
          fetchContractData(account)
        }
      }

      eth.on('accountsChanged', onAccountsChanged)
      eth.on('chainChanged', onChainChanged)

      return () => {
        if (eth.removeListener) {
          eth.removeListener('accountsChanged', onAccountsChanged)
          eth.removeListener('chainChanged', onChainChanged)
        }
      }
    }
  }, [handleInit, account, fetchContractData])

  useEffect(() => {
    if (!account) return
    const timer = setInterval(() => {
      fetchContractData(account)
    }, 2500)
    return () => clearInterval(timer)
  }, [account, fetchContractData])

  async function connectWallet() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask не знайдено Встановіть розширення MetaMask')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      localStorage.removeItem('birdly_wallet_disconnected')
      const eth = (window as any).ethereum
      const accounts = await eth.request({ method: 'eth_requestAccounts' })
      await ensureAnvilChain()
      if (accounts && accounts.length > 0) {
        await handleInit(accounts[0])
      }
    } catch (err: any) {
      if (err?.code === -32002) {
        setError('Запит у MetaMask вже відкрито Перевірте вікно MetaMask')
      } else if (err?.code !== 4001) {
        setError(err?.message || 'Помилка підключення MetaMask')
      }
    } finally {
      setConnecting(false)
    }
  }

  async function changeWallet() {
    if (typeof window === 'undefined' || !(window as any).ethereum) return
    setConnecting(true)
    setError(null)
    try {
      const eth = (window as any).ethereum
      await eth.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
      const accounts = await eth.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        localStorage.removeItem('birdly_wallet_disconnected')
        await handleInit(accounts[0])
      }
    } catch (err: any) {
      if (err?.code === -32002) {
        setError('Запит у MetaMask вже відкрито Перевірте вікно MetaMask')
      } else if (err?.code !== 4001) {
        setError(err?.message || 'Помилка зміни гаманця')
      }
    } finally {
      setConnecting(false)
    }
  }

  function disconnectWallet() {
    localStorage.setItem('birdly_wallet_disconnected', 'true')
    setAccount(null)
    setStatus(null)
    setBalance('0')
    setPendingPlanId(null)
    setIsCancelling(false)
    setError(null)
  }

  async function subscribe(planId: number, price: bigint): Promise<boolean> {
    if (!account) {
      await connectWallet()
      return false
    }

    setPendingPlanId(planId)
    setError(null)

    try {
      const eth = (window as any).ethereum
      if (!eth) throw new Error('MetaMask не знайдено')

      await ensureAnvilChain()
      const chainId = await eth.request({ method: 'eth_chainId' })
      if (chainId !== '0x7a69') {
        throw new Error('Будь ласка перемкніть мережу в MetaMask на Anvil Localhost 31337')
      }

      const directProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
      const targetAddress = (await getDeployedAddress(directProvider)) || CONTRACT_ADDRESS
      const browserProvider = new ethers.BrowserProvider(eth)
      const signer = await browserProvider.getSigner()
      const liveContract = new ethers.Contract(targetAddress, CONTRACT_ABI, signer)

      const nextNonce = await directProvider.getTransactionCount(account, 'pending')

      const tx = await liveContract.subscribe(planId, {
        value: price,
        gasLimit: 250000n,
        nonce: nextNonce
      })

      const receipt = await directProvider.waitForTransaction(tx.hash, 1, 15000)
      if (!receipt || receipt.status !== 1) {
        throw new Error('Транзакція не була підтверджена мережею')
      }

      await fetchContractData(account)
      return true
    } catch (err: any) {
      const msg = err?.reason || err?.message || ''
      if (err?.code === 4001 || msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) {
        setError('Транзакцію скасовано у MetaMask')
      } else if (err?.code === -32002) {
        setError('Запит у MetaMask вже відкрито Перевірте вікно MetaMask')
      } else if (msg.includes('SubscriptionAlreadyActive')) {
        setError('У вас вже є активна підписка Щоб змінити план спочатку скасуйте її')
      } else if (msg.includes('insufficient funds')) {
        setError('Недостатньо коштів на балансі гаманця для оплати')
      } else {
        setError(msg || 'Помилка оформлення підписки')
      }
      return false
    } finally {
      setPendingPlanId(null)
    }
  }

  async function cancelSubscription(): Promise<boolean> {
    if (!account) return false

    setIsCancelling(true)
    setError(null)

    try {
      const eth = (window as any).ethereum
      if (!eth) throw new Error('MetaMask не знайдено')

      await ensureAnvilChain()
      const chainId = await eth.request({ method: 'eth_chainId' })
      if (chainId !== '0x7a69') {
        throw new Error('Будь ласка перемкніть мережу в MetaMask на Anvil Localhost 31337')
      }

      const directProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
      const targetAddress = (await getDeployedAddress(directProvider)) || CONTRACT_ADDRESS
      const browserProvider = new ethers.BrowserProvider(eth)
      const signer = await browserProvider.getSigner()
      const liveContract = new ethers.Contract(targetAddress, CONTRACT_ABI, signer)

      const nextNonce = await directProvider.getTransactionCount(account, 'pending')

      const tx = await liveContract.cancelSubscription({
        gasLimit: 150000n,
        nonce: nextNonce
      })

      const receipt = await directProvider.waitForTransaction(tx.hash, 1, 15000)
      if (!receipt || receipt.status !== 1) {
        throw new Error('Помилка підтвердження скасування в мережі')
      }

      await fetchContractData(account)
      return true
    } catch (err: any) {
      const msg = err?.reason || err?.message || ''
      if (err?.code === 4001 || msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) {
        setError('Скасування відхилено у MetaMask')
      } else if (err?.code === -32002) {
        setError('Запит у MetaMask вже відкрито Перевірте вікно MetaMask')
      } else {
        setError(msg || 'Помилка скасування підписки')
      }
      return false
    } finally {
      setIsCancelling(false)
    }
  }

  async function refreshStatus() {
    if (account) {
      await fetchContractData(account)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        account,
        balance,
        plans,
        status,
        pendingPlanId,
        isCancelling,
        connecting,
        error,
        connectWallet,
        changeWallet,
        disconnectWallet,
        subscribe,
        cancelSubscription,
        refreshStatus
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}
