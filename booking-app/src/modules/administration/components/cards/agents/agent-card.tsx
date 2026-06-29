/*************************************************************
 * booking-app - agent-card.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 05.02.22 - 15:50
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback } from 'react';
import clsx from 'clsx';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Switch,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AlternateEmail,
  LocationCity,
  LocationOn,
  Person,
} from '@mui/icons-material';
import { updateAgent } from '../../../utils/agent-utils';

interface AgentCardProps {
  agent: any;
}

export const AgentCard: React.FC<AgentCardProps> = ({ children, agent }) => {
  const handleSwitchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateAgent(agent._id, { active: evt.target.checked });
  };

  const isDisabled = useCallback(() => {
    return agent.active === false;
  }, [agent]);

  return (
    <Card
      className={clsx('w-100')}
      sx={{ backgroundColor: isDisabled() ? '#e5e5e5' : '' }}>
      <CardHeader
        avatar={
          <Avatar
            className={clsx('fw-bold')}
            sx={{ backgroundColor: '#faa000' }}
            aria-label="recipe">
            {!!agent.firstName && !!agent.secondName
              ? `${agent.firstName.slice(0, 1).toUpperCase()}${agent?.secondName
                  .slice(0, 1)
                  .toUpperCase()}`
              : `${agent.userName.slice(0, 2)}`}
          </Avatar>
        }
        title={
          <Box className={clsx('text-capitalize w-100 text-start')}>
            {!!agent.firstName && !!agent.secondName
              ? `${agent.firstName} ${agent?.secondName}`
              : `${agent.userName}`}
          </Box>
        }
        subheader={
          <Box className={clsx(' w-100 text-start')}>
            {agent.birthDate
              ? format(parseISO(agent.birthDate), 'PPP', { locale: de })
              : '-'}
          </Box>
        }
        action={
          <Switch onChange={handleSwitchChange} checked={!isDisabled()} />
        }
      />
      <CardContent>
        <Box
          className={clsx('w-100 px-2 d-flex flex-column align-items-start')}
          sx={{ fontSize: '.9rem' }}>
          <Box className={clsx('d-flex gap-1 align-items-center')}>
            <Person sx={{ fontSize: '1rem' }} />
            <Box>{agent.userName}</Box>
          </Box>
          <Box className={clsx('d-flex gap-1 align-items-center')}>
            <AlternateEmail sx={{ fontSize: '1rem' }} />
            <Box>{agent.email}</Box>
          </Box>
          <Box className={clsx('d-flex gap-1 align-items-center')}>
            <LocationOn sx={{ fontSize: '1rem' }} />
            <Box>
              {!!agent.address && agent.address}
              {!!agent.postalCode && ', ' + agent.postalCode}{' '}
              {!!agent.city && agent.city}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
