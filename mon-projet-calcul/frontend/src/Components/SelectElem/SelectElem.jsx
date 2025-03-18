import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Select,
  MenuItem,
  FormControl,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing(1),
  },
  // withoutLabel: {
  //   marginTop: theme.spacing(3),
  // },
  // textField: {
  //   width: '25ch',
  // },
  input: {
    // color: 'blue',
    backgroundColor: (theme.palette.secondary.main === "#000000" ? "#ffffff" : theme.palette.secondary.main),
  },
  inputDisabled: {
    color: "#000000",
    backgroundColor: "transparent"
  },
  inputAdornment: {
    // paddingRight: '1em',
    color: 'black'
  },
  label: {
    fontWeight: "bold",
    width: "100%"
  }
}))

const SelectElem = ({
  label,
  value,
  name,
  placeholder,
  disabled,
  onChange,
  list,
  children
}) => {
  const classes = useStyles();

  return (
    <FormControl
      fullWidth
    >
      <Typography className={classes.label}>{label}</Typography>
      <Select
        className={disabled ? classes.inputDisable : classes.input}
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        disableUnderline
        IconComponent={() => <ExpandMoreIcon color="primary" />}
      >
        {list?.map((item, index) => (
          <MenuItem key={index} value={item.id}>{`${item.name}`}</MenuItem>
        ))}
        {children}
      </Select>
    </FormControl>
  )
};

export default SelectElem;