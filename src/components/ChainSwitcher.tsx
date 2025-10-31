import React from 'react'
import styled from 'styled-components'
import { useChain } from '../contexts/ChainContext'
import { ChainType } from '../types/chains'
import { CHAIN_CONFIGS } from '../chain-config'

const Container = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const ChainButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? 'var(--gamba-ui-primary-color, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$active ? 'var(--gamba-ui-primary-color, #8B5CF6)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const ChainIcon = styled.span`
  font-size: 16px;
`

const Label = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 8px;
`

const CHAIN_ICONS: Record<ChainType, string> = {
  [ChainType.SOLANA]: '◎',
  [ChainType.ETHEREUM]: 'Ξ',
  [ChainType.BNB]: '◈',
}

export function ChainSwitcher() {
  const { activeChain, setActiveChain } = useChain()

  return (
    <Container>
      <Label>Network:</Label>
      {Object.values(ChainType).map(chain => (
        <ChainButton
          key={chain}
          $active={activeChain === chain}
          onClick={() => setActiveChain(chain)}
        >
          <ChainIcon>{CHAIN_ICONS[chain]}</ChainIcon>
          {CHAIN_CONFIGS[chain].name}
        </ChainButton>
      ))}
    </Container>
  )
}
