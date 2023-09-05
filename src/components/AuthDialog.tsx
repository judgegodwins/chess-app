import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import { object, string } from "yup";
import { usePost } from "../hooks/apiHooks";
import { FormikProvider, Form } from "formik";
import { CreateTokenResponse } from "../types/responses";
import { updateAuth } from "../slices/authSlice";
import { useAppDispatch } from "../hooks/redux";

const Schema = object({
  username: string().required("Username is required"),
});

export function AuthDialog(props: {
  open: boolean;
  // manualFinish?: boolean;
  handleClose: React.MouseEventHandler;
  onComplete: (data: CreateTokenResponse, setSubmitting?: React.Dispatch<React.SetStateAction<boolean>>) => any;
}) {
  const dispatch = useAppDispatch();
  // const [submitting, setSubmitting] = useState(false);

  const { formik } = usePost<CreateTokenResponse,
    { username: string },
    typeof Schema
  >({
    url: "/token",
    initialValues: { username: "" },
    schema: Schema,
    type: "post",
    notify: true,
    onComplete: (data) => {
      localStorage.setItem("token", data.token);
      dispatch(
        updateAuth({
          ...data,
          status: "verified",
        })
      );

      props.onComplete(data);

      // if (!props.manualFinish) setSubmitting(false)
    },
  });

  return (
    <FormikProvider value={formik}>
      <Dialog open={props.open}>
        <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle>Provide a username</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To start a game, please enter a username.
            </DialogContentText>
            <TextField
              // autoFocus
              margin="dense"
              id="username"
              label="Username"
              type="text"
              {...formik.getFieldProps("username")}
              fullWidth
              variant="standard"
              error={Boolean(formik.touched.username && formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={props.handleClose} disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <LoadingButton loading={formik.isSubmitting} type="submit">
              Continue
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>
    </FormikProvider>
  );
}
