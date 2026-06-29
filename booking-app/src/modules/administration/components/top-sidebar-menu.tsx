/*************************************************************
 * booking-app - top-sidebar-menu.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 16:20
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AuthContext,
  IdentityProps,
} from '../../../contexts/auth/auth-context';
import { AccountCircle } from '@mui/icons-material';
import clsx from 'clsx';
import { GlobalAppContext } from '../../../contexts/global-app-context';
import { ColorButton } from '../../../components/buttons/buttons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface TopSidebarMenuProps {
  openNewAppointmentDialog?: (val: boolean) => void;
}

export const TopSidebarMenu: React.FC<TopSidebarMenuProps> = ({
  children,
  openNewAppointmentDialog,
}) => {
  const { t } = useTranslation();
  const { section } = useParams();
  const { isLoggedIn, getIdentity, logOut } = useContext(AuthContext);
  const { center } = useContext(GlobalAppContext);
  const [anchorUseMenuEl, setAnchorUseMenuEl] =
    React.useState<null | HTMLElement>(null);
  const [identity, setIdentity] = React.useState<IdentityProps>();

  const openUserMenu = Boolean(anchorUseMenuEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorUseMenuEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorUseMenuEl(null);
  };

  useEffect(() => {
    if (!identity && isLoggedIn) {
      getIdentity().then((data) => {
        setIdentity(data);
      });
    }
  }, []);

  return (
    <AppBar position="static" sx={{ zIndex: '99' }}>
      <Toolbar
        className={clsx('w-100 bg-white d-flex justify-content-between')}>
        <Box className={clsx('d-flex gap-1')}>
          {section === 'today' && (
            <>
              <ColorButton sx={{ backgroundColor: '#6790A0' }}>
                {t('admin.quickCheck')}
              </ColorButton>
              <ColorButton
                onClick={() => {
                  if (openNewAppointmentDialog) {
                    openNewAppointmentDialog(true);
                  }
                }}
                sx={{ backgroundColor: '#6790A0' }}>
                {t('admin.create-appointment')}
              </ColorButton>
            </>
          )}
        </Box>
        <Box
          className={clsx(
            'fw-bolder text-dark text-uppercase flex-grow-1 d-none'
          )}
          sx={{ fontSize: '1.2rem' }}>
          {center?.name}
        </Box>
        {isLoggedIn && (
          <Box className={clsx('d-flex gap-1 align-items-center')}>
            {!!identity && (
              <Box className={clsx('text-dark opacity-75')}>
                {identity.username}
              </Box>
            )}
            <Box>
              <IconButton
                className={clsx('')}
                edge="end"
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                aria-expanded={openUserMenu ? 'true' : undefined}
                onClick={handleMenuClick}>
                <AccountCircle />
              </IconButton>
              <Menu
                className={clsx('')}
                anchorEl={anchorUseMenuEl}
                open={openUserMenu}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
                id="user-menu">
                <MenuItem disabled>
                  <Box className={clsx('fw-bold')} sx={{ fontSize: '.8rem' }}>
                    {identity?.fullName}
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose} disabled>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    logOut();
                  }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
