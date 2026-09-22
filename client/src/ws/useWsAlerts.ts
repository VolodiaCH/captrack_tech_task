import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWsConnection } from './useWsConnection';
import { useAlertStore } from '../state/alertStore';
import { ServerMessage, ClientMessage } from './types';

export function useWsAlerts(yearMonth: string) {
  const { socket, isConnected } = useWsConnection();
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();
  const previousYearMonth = useRef<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    if (previousYearMonth.current !== yearMonth) {
      const subscribeMessage: ClientMessage = {
        type: 'subscribe',
        yearMonth,
      };
      socket.send(JSON.stringify(subscribeMessage));
      previousYearMonth.current = yearMonth;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);

        if (message.type === 'budget_status') {
          queryClient.setQueryData(['budget', message.yearMonth], {
            hasBudget: message.hasBudget,
            budget: message.budget,
            spent: message.spent,
            remaining: message.remaining,
            usagePct: message.usagePct,
            currency: queryClient.getQueryData<any>(['budget', message.yearMonth])?.currency || 'USD',
          });
        } else if (message.type === 'threshold_alert') {
          addAlert({
            yearMonth: message.yearMonth,
            threshold: message.threshold,
            spent: message.spent,
            budget: message.budget,
            usagePct: message.usagePct,
            firedAt: message.firedAt,
            acknowledged: false,
          });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, isConnected, yearMonth, queryClient, addAlert]);
}
