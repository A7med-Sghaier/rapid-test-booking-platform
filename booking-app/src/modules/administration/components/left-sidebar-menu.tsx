/*************************************************************
 * booking-app - left-sidebar-menu.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 15:07
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useRef } from 'react';
import { Box, List, ListItem, SvgIcon } from '@mui/material';
import clsx from 'clsx';
import { YetaHeader } from '../../../components/yeta/yeta-header';
import { makeStyles } from '@mui/styles';
import { LeftMenuItems } from '../resources/constants/left-menu-items';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalAppContext } from '../../../contexts/global-app-context';

const useStyles = makeStyles({
  menuItem: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    opacity: '0.8',
    border: '0',
    borderLeft: '.3rem solid  rgba(255 ,129, 0 , 0)',
    '&.active': {
      background: 'rgba(176,177,183,0.15)',
      borderLeft: '.3rem solid  rgba(255 ,129, 0 , .6)',
    },
    '&:hover': { background: 'rgba(176,177,183,0.15)', cursor: 'pointer' },
  },
  menuSubItem: {
    fontSize: '0.85rem',
    fontWeight: 'bold',

    opacity: '0.8',
    border: '0',
    '&:hover': { background: 'rgba(176,177,183,0.15)', cursor: 'pointer' },
  },
});

interface LeftSidebarMenuProps {
  className?: string;
}
export const LeftSidebarMenu: React.FC<LeftSidebarMenuProps> = ({
  children,
  className,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { section } = useParams();
  const navigate = useNavigate();
  const { center } = useContext(GlobalAppContext);

  const handleMenuItemClick = (parentItem: string, sectionId: string) => {
    navigate(parentItem);
    const menuContainer = document.getElementById(parentItem + '-container');
    if (menuContainer) {
      const containerOffsetTop = menuContainer.offsetTop;
      const sibleElmnt = document.getElementById(sectionId);
      if (sibleElmnt) {
        const scrollTo = sibleElmnt.offsetTop;
        if (scrollTo) {
          menuContainer.scrollTo({
            top: scrollTo - (containerOffsetTop || 0),
            behavior: 'smooth',
          });
        }
      }
    }
  };

  return (
    <Box
      className={clsx(className, 'overflow-hidden pt-3')}
      sx={{
        // backgroundColor: ThemeBlue.primary.main,
        backgroundColor: '#6790A0',
        zIndex: '99',
        boxShadow: '1px 1px 6px 1px rgb(0 0 0 / 20%)',
      }}>
      <YetaHeader />
      <Box
        className={clsx('mt-3 text-white fw-bold')}
        sx={{ fontSize: '1rem' }}>
        {center?.name}
      </Box>
      <Box className={clsx('mt-1')}></Box>
      <List className={clsx('fw-bold mt-md-4')}>
        {LeftMenuItems.map((item) => (
          <div key={`left-menu-item-${item.key}`}>
            <ListItem
              onClick={() => {
                navigate('/admin/sections/' + item.key);
              }}
              className={clsx(
                'text-white',
                classes.menuItem,
                item.classes,
                !item.key ? 'p-0' : 'py-3',
                item.key === section ? 'active' : ''
              )}>
              {!!item.icon && (
                <SvgIcon
                  className={clsx('me-2')}
                  sx={{ fontSize: '1.2rem' }}
                  component={item.icon}
                />
              )}
              {!!item.key &&
                // @ts-ignore
                t('menu.' + item.key)}{' '}
              {!!item.postfix && item.postfix}
            </ListItem>
            {item.subItems &&
              item.subItems.length &&
              item.subItems.map((subItem) => (
                <ListItem
                  key={`left-menu-sub-item-${subItem.key}`}
                  className={clsx(
                    'text-white py-2 ms-4',
                    classes.menuSubItem,
                    subItem.classes
                  )}
                  onClick={() => {
                    if (subItem.isInternLink) {
                      handleMenuItemClick(
                        item.key as string,
                        subItem.key as string
                      );
                    } else {
                      navigate(
                        '/admin/sections/' + item.key + '/' + subItem.key
                      );
                    }
                  }}>
                  {!!subItem.icon && (
                    <SvgIcon
                      className={clsx('me-2')}
                      sx={{ fontSize: '1.2rem' }}
                      component={subItem.icon}
                    />
                  )}
                  {!!subItem.key &&
                    // @ts-ignore
                    t('menu.' + subItem.key)}{' '}
                  {!!subItem.postfix && subItem.postfix}
                </ListItem>
              ))}
          </div>
        ))}
      </List>
    </Box>
  );
};
