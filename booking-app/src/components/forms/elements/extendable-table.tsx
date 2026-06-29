/*************************************************************
 * booking-app - extendable-table.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 06.02.22 - 16:07
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FormElement, FormElementProps } from '../form-element';
import {
  DataFormContext,
  DataFormProvider,
} from '../../../contexts/forms/data-form-context';
import clsx from 'clsx';
import {
  Box,
  debounce,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { ColorButton } from '../../buttons/buttons';
import { Form } from '../form';
import { FormTypeProps } from '../../../interfaces/form-type-props';

interface ExtendableTableProps extends FormElementProps {
  value: any;
}

export const ExtendableTable: React.FC<ExtendableTableProps> = ({
  children,
  value,
  formKey,
  element,
}) => {
  const { t } = useTranslation();
  const [radioGroupVal, setRadioGroupVal] = useState<string>('');
  const [addForm, setAddForm] = useState<FormTypeProps | undefined>(
    element.controlAddForm
  );
  const { formValues, setFormValue } = useContext(DataFormContext);

  const handleAddItem = (value: any) => {
    setFormValue(element.key, [...formValues[element.key], value]);
    if (element.controlAddForm) {
      setAddForm(undefined);
    }
  };

  const handleControlChange = (key: string, value: any, idx: number) => {
    const clonedValues = [...formValues[element.key]];
    let clonedRowVal = clonedValues[idx];
    clonedRowVal = { ...clonedRowVal, [key]: value };
    clonedValues[idx] = clonedRowVal;
    setFormValue(element.key, clonedValues);
  };

  const handleRowAction = (values: any[]) => {
    setFormValue(element.key, values);
  };

  const handleRadioGroupChange = (value: string) => {
    const radioControl = element.rowGroup?.cells.find(
      (item) => item.elementType === 'radio'
    );
    if (radioControl) {
      const clonedValues = formValues[element.key].reduce(
        (items: any[], item: any, itemIdx: number) => {
          items.push({
            ...item,
            [radioControl.key]: value === item[radioControl.valueKey as string],
          });
          return items;
        },
        []
      );
      // clonedValues[idx] = { ...clonedValues[idx], isActive: checked };
      setFormValue(element.key, clonedValues);
    }
  };

  useEffect(() => {
    const radioControl = element.rowGroup?.cells.find(
      (item) => item.elementType === 'radio'
    );
    if (
      element.rowGroup?.type === 'radioGroup' &&
      formValues[element.key] &&
      radioControl
    ) {
      const activeOne = formValues[element.key].find(
        (item: any) => item[radioControl.key] === true
      );
      if (activeOne) {
        setRadioGroupVal(activeOne[radioControl.valueKey as string]);
      }
    }
  }, [formValues]);

  useEffect(() => {
    if (addForm === undefined && element.controlAddForm) {
      setAddForm({ ...element.controlAddForm });
    }
  }, [addForm]);

  const TableContent = useMemo(() => {
    if (formValues) {
      const tableValues = formValues[element.key];
      if (!!tableValues && !!tableValues.length) {
        return tableValues.map((row: any, rowIdx: number) => (
          <TableRow key={`table-row-${element.key}-${rowIdx}`}>
            {!!element.rowGroup && (
              <RowCells
                row={row}
                rowCells={element.rowGroup.cells}
                element={element}
                formKey={formKey}
                rowIdx={rowIdx}
                defaultVal={value}
                handleControlChange={handleControlChange}
                handleRowAction={handleRowAction}
              />
            )}
          </TableRow>
        ));
      }
    } else {
      return <></>;
    }
  }, [formValues]);

  return (
    <Box className={clsx('w-100 mb-4')}>
      {addForm && (
        <DataFormProvider>
          <AddSection onAdd={handleAddItem} form={addForm} />
        </DataFormProvider>
      )}
      <Box>
        <TableContainer component={Paper}>
          <RadioGroup
            name="radio-buttons-group"
            value={radioGroupVal}
            onChange={(evt) => {
              handleRadioGroupChange(evt.target.value);
            }}>
            <Table aria-label="customized table">
              <StyledTableHead className={clsx('d-none')}>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell
                    className={clsx('text-white fw-bold')}
                    align="left">
                    Label
                  </TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>{TableContent}</TableBody>
            </Table>
          </RadioGroup>
        </TableContainer>
      </Box>
    </Box>
  );
};

interface AddSectionProps {
  onAdd: (data: any) => void;
  form: any;
}

interface RowCellsProps {
  rowCells: any[];
  rowIdx: number;
  formKey: string;
  defaultVal: any;
  row: any;
  element: any;
  handleControlChange: (key: string, value: any, rowIdx: number) => void;
  handleRowAction: (values: any[]) => void;
}

const RowCells: React.FC<RowCellsProps> = ({
  children,
  rowCells,
  rowIdx,
  formKey,
  defaultVal,
  row,
  element,
  handleControlChange,
  handleRowAction,
}) => {
  const { formValues } = useContext(DataFormContext);

  return (
    <>
      {rowCells.map((cell, cellIdx) => (
        <TableCell
          className={clsx('py-1', cell.cssClasses)}
          key={`row-${rowIdx}-table-cell-${cell.key}-${cellIdx}`}>
          {/* TO-DO: build Rows by group type*/}
          {cell.type === 'control' && (
            <FormElement
              element={cell}
              formKey={formKey}
              isDeepElement
              groupKey={element.key}
              radioGroupName={element.radioGroupName}
              radioVal={cell.valueKey ? row[cell.valueKey] : undefined}
              value={
                defaultVal
                  ? defaultVal[rowIdx]
                    ? defaultVal[rowIdx][cell.key]
                    : undefined
                  : undefined
              }
              onDeepChange={(key, value) => {
                if (cell.elementType !== 'radio') {
                  handleControlChange(key, value, rowIdx);
                }
              }}
            />
          )}
          {cell.type === 'text' && <Box>{row[cell.key]}</Box>}
        </TableCell>
      ))}
      <TableCell className={clsx()} align="right">
        {element?.rowGroup?.rowAction && (
          <IconButton
            onClick={() => {
              element.rowGroup.rowAction.action(
                formValues,
                rowIdx,
                handleRowAction
              );
            }}>
            <element.rowGroup.rowAction.IconBtn />
          </IconButton>
        )}
      </TableCell>
    </>
  );
};

const AddSection: React.FC<AddSectionProps> = ({ children, onAdd, form }) => {
  const { t } = useTranslation();
  const { formValues } = useContext(DataFormContext);

  return (
    <Box className={clsx('d-flex gap-3 mb-2 align-items-center')}>
      <Form form={form} />
      <Box className={clsx('flex-grow-1 w-100 text-start')}>
        <ColorButton
          // disabled={!newElmntVal}
          className={clsx('px-2 py-2')}
          onClick={() => {
            onAdd(formValues);
          }}
          sx={{ backgroundColor: '#617c85' }}
          size="small">
          {t('form.actions.add')}
        </ColorButton>
      </Box>
    </Box>
  );
};

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#246378c2',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    //  backgroundColor: theme.palette.common.black,
    // color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    // backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));
