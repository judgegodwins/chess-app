import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ConfirmDialog(props: {
  title: string;
  contentText: string;
  open: boolean;
  extraContent?: JSX.Element;
  handleAccept: React.MouseEventHandler;
  handleReject: React.MouseEventHandler;
}) {
  return (
    <Dialog
      open={props.open}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {props.contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleReject} autoFocus>
          Reject
        </Button>
        <Button onClick={props.handleAccept} autoFocus>
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}
