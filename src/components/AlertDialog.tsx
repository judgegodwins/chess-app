import { Box, CircularProgress, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog(props: {
  title: string;
  contentText: string;
  open: boolean;
  alertOnly?: boolean;
  extraContent?: JSX.Element;
  handleClose?: React.MouseEventHandler;
}) {
  return (
    <Dialog
      open={props.open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2}>
          {props.alertOnly && (
            <Box>
              <CircularProgress />
            </Box>
          )}

          <Stack spacing={2}>
            <DialogContentText id="alert-dialog-description">
              {props.contentText}
            </DialogContentText>

            {props.extraContent}
          </Stack>
        </Stack>
      </DialogContent>
      {!props.alertOnly && (
        <DialogActions>
          <Button onClick={props.handleClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
