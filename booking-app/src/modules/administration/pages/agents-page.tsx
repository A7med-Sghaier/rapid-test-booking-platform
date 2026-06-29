/*************************************************************
 * booking-app - agents-page.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 04.02.22 - 15:36
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useState } from 'react';
import { Box, Container, Fab } from '@mui/material';
import clsx from 'clsx';
import { Add } from '@mui/icons-material';
import { ThemeBlue } from '../../../themes/theme-blue';
import { makeStyles } from '@mui/styles';
import { DataFormProvider } from '../../../contexts/forms/data-form-context';
import { AgentsContext } from '../contexts/agents-context';
import { AgentCard } from '../components/cards/agents/agent-card';
import { NewAgentDialog } from '../components/cards/dialogs/new-agent-dialog';

const useStyles = makeStyles({
  addBtn: {
    '&:hover': {
      backgroundColor: ThemeBlue.secondary.light,
    },
  },
});

export const AgentsPage: React.FC = ({ children }) => {
  const classes = useStyles();
  const { agents } = useContext(AgentsContext);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  return (
    <Container maxWidth={false} className={clsx('flex-grow-1')}>
      <Box className={clsx('py-3 h-100 d-flex flex-column')}>
        <Box className={clsx('w-100 d-flex')}>
          {agents.map((agent) => (
            <Box
              key={`agent-${agent.userName}`}
              className={clsx('px-2 col-10 col-sm-6 col-lg-4 col-xl-3')}>
              <AgentCard agent={agent} />
            </Box>
          ))}
        </Box>
        <Box
          className={clsx(
            'flex-grow-1 d-flex justify-content-center align-items-center'
          )}>
          <Fab
            className={clsx(classes.addBtn)}
            size="medium"
            sx={{ backgroundColor: ThemeBlue.secondary.main }}
            aria-label="add">
            <Add
              className={clsx('text-white')}
              onClick={() => {
                setOpenDialog(true);
              }}
            />
          </Fab>
        </Box>
      </Box>
      <DataFormProvider>
        <NewAgentDialog openAgentForm={openDialog} openDialog={setOpenDialog} />
      </DataFormProvider>
    </Container>
  );
};
