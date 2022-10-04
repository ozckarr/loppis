import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Grid, Snackbar, TextField } from "@material-ui/core";
import { Auth } from "aws-amplify";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { useState } from "react";
import Alert from "@mui/material/Alert";

interface IFormInput {
  username: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [open, setOpen] = useState(false);
  const [signUpError, setSignUpError] = useState<string>("");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log("Errors: " + errors);
    console.log("Sign up");
    console.log(data);

    try {
      signUpWithEmailAndPassword(data);
    } catch (err) {
      console.log(err);
      setSignUpError(err.message);
      setOpen(true);
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  async function signUpWithEmailAndPassword(data: IFormInput) {
    const { username, password, email } = data;
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email, // optional
        },
        //  autoSignIn: {
        // optional - enables auto sign in after user is confirmed
        //   enabled: true,
        //},
      });
      console.log(user);
    } catch (error) {
      console.log("error signing up:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container direction="column" alignItems="center" spacing={1}>
        <Grid item style={{ marginTop: "1em" }}>
          <TextField
            variant="outlined"
            id="username"
            name="username"
            label="Username"
            type="text"
            error={errors.username ? true : false}
            helperText={errors.username ? errors.username.message : null}
            {...register("username", {
              required: { value: true, message: "Please enter a username." },
              minLength: {
                value: 3,
                message: "Please enter a username between 3-16 characters.",
              },
              maxLength: {
                value: 16,
                message: "Please enter a username between 3-16 characters.",
              },
            })}
          />
        </Grid>
        <Grid item>
          {/*TODO: Add eamil rules*/}

          <TextField
            variant="outlined"
            id="email"
            name="email"
            label="Email"
            type="email"
            error={errors.email ? true : false}
            helperText={errors.email ? errors.email.message : null}
            {...register("email", {
              required: { value: true, message: "Please enter a valid email." },
            })}
          />
        </Grid>
        <Grid item>
          {/*TODO: Add password rules*/}
          <TextField
            variant="outlined"
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="off"
            error={errors.password ? true : false}
            helperText={errors.password ? errors.password.message : null}
            {...register("password", {
              required: { value: true, message: "Please enter a password." },
              minLength: {
                value: 8,
                message: "Please enter a password with at least 8 characters.",
              },
            })}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" type="submit">
            Sign Up
          </Button>
        </Grid>
      </Grid>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {signUpError}
        </Alert>
      </Snackbar>
    </form>
  );
}
