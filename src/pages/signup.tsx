import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Grid, Snackbar, TextField } from "@material-ui/core";
import { Auth } from "aws-amplify";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import { useUser } from "../context/AuthContext";
import { CognitoUser } from "@aws-amplify/auth";

interface IFormInput {
  username: string;
  email: string;
  password: string;
  code: string;
}

export default function Signup() {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const [signUpError, setSignUpError] = useState<string>("");

  // TODO: make verification possible all the time
  const [showCode, setShowCode] = useState<boolean>(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      if (showCode) {
        confirmSignUp(data);
      } else {
        await signUpWithEmailAndPassword(data);
        setShowCode(true);
      }
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

  async function signUpWithEmailAndPassword(
    data: IFormInput
  ): Promise<CognitoUser> {
    const { username, password, email } = data;
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email, // optional
        },
      });
      console.log("Signed up a: ", user);
      return user;
    } catch (error) {
      throw error;
    }
  }
  console.log("user value: " + user);

  async function confirmSignUp(data: IFormInput) {
    const { username, password, code } = data;
    try {
      await Auth.confirmSignUp(username, code);
      const amplifyUser = await Auth.signIn(username, password);
      console.log("success", amplifyUser);
    } catch (error) {
      console.log("error confirming sign up", error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container direction="column" alignItems="center" spacing={1}>
        {!showCode && (
          <React.Fragment>
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
                  required: {
                    value: true,
                    message: "Please enter a username.",
                  },
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
              {/*TODO: Add email rules*/}

              <TextField
                variant="outlined"
                id="email"
                name="email"
                label="Email"
                type="email"
                error={errors.email ? true : false}
                helperText={errors.email ? errors.email.message : null}
                {...register("email", {
                  required: {
                    value: true,
                    message: "Please enter a valid email.",
                  },
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
                  required: {
                    value: true,
                    message: "Please enter a password.",
                  },
                  minLength: {
                    value: 8,
                    message:
                      "Please enter a password with at least 8 characters.",
                  },
                })}
              />
            </Grid>
          </React.Fragment>
        )}
        {showCode && (
          <Grid item>
            <TextField
              variant="outlined"
              id="code"
              name="code"
              label="Verification Code"
              type="text"
              error={errors.code ? true : false}
              helperText={errors.username ? errors.code.message : null}
              {...register("code", {
                required: {
                  value: true,
                  message: "Please enter a verification code.",
                },
                minLength: {
                  value: 6,
                  message: "Your verification code is 6 characters long.",
                },
                maxLength: {
                  value: 6,
                  message: "Your verification code is 6 characters long.",
                },
              })}
            />
          </Grid>
        )}

        <Grid item>
          <Button variant="contained" type="submit">
            {showCode ? "Confirm Code" : "Sign up"}{" "}
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
