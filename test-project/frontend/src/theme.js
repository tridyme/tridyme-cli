
export default function GetTheme(params) {
  return {
    palette: {
      type: 'light',
      background: {
        default: '#ffffff',
      },
      primary: {
        // light: will be calculated from palette.primary.main,
        //main: '#0D4684',
        main: '#0082DE',
        // dark: will be calculated from palette.primary.main,
        // contrastText: will be calculated to contrast with palette.primary.main
      },
      secondary: {
        //light: '#0066ff',
        main: '#ffffff',
        dark: "#FAFAFA",
        // dark: will be calculated from palette.secondary.main,
        contrastText: '#0082DE'
      },
    },
    overrides: {
      MuiCard: {
        root: {
          borderRadius: '0px'
        },
      },
      MuiPaper: {
        root: {
          borderRadius: '0px'
        },
      },
      MuiInput: {
        root: {
          // color: "#000000",
          // backgroundColor: "#ffffff",
          borderRadius: '0px',
          padding: '5px',
          underline: {
            borderBottomColor: "transparent"
          }
        }
      },
      MuiTextField: {
        root: {
          // color: "#000000",
          // backgroundColor: "#ffffff",
          // "& .MuiInput": {
          //   borderRadius: '0px',
          //   borderColor: 'transparent',
          //   height: "12em",
          //   underline: {
          //     borderBottomColor: "transparent"
          //   }
          // },
        }
      },
      MuiTab: {
        root: {
          outline: 'none',
          textTransform: 'none',
          '&$selected': {
            fontWeight: "bold",
          },
        }
      },
      MuiButton: {
        root: {
          margin: "0.5em",
          borderRadius: '0px',
          // width: '100%',
          textTransform: 'none',
          fontSize: "1em",
          fontWeight: "bold"
        }
      }
    },
  }
};

