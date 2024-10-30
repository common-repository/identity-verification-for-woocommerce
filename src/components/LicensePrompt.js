import React from "react";
import {
  Button,
  TextField,
  Layout,
  Card,
  Form,
  TextContainer,
} from "@shopify/polaris";
import { Formik } from "formik";
import axios from "axios";
import { Box } from "rebass";

import { useToast } from "../providers/ToastProvider";
import { useShop } from "../providers/ShopProvider";
import { activateLicense } from "../services/wpApi";
import { useHistory } from "react-router-dom";

export default function LicensePrompt() {
  const setToast = useToast();
  const { setShop } = useShop();
  const history = useHistory();

  return (
    <Card title="Activate Real ID">
      <Card.Section>
        <TextContainer>
          <p>
            To activate the plugin, use your license key from the Real ID
            dashboard:
          </p>
          <p>
            <a href="https://dashboard.getverdict.com" target="_blank">
              Get your license key
            </a>
          </p>
        </TextContainer>
      </Card.Section>
      <Card.Section>
        <Formik
          initialValues={{ licenseKey: "" }}
          onSubmit={(values, { setSubmitting }) => {
            activateLicense({ licenseKey: values.licenseKey })
              .then(({ data }) => {
                console.log({ data });
                setSubmitting(false);
                setShop(data.shop);
                setToast("License activated.");
              })
              .catch((e) => {
                console.error(e);
                setToast("Not a valid license key. Please try again.");
                setSubmitting(false);
              });
          }}
        >
          {({ setFieldValue, values, isSubmitting, errors, handleSubmit }) => (
            <Form>
              <TextField
                label="License Key"
                value={values.licenseKey}
                onChange={(value) => {
                  setFieldValue("licenseKey", value);
                }}
                connectedRight={
                  <Button primary onClick={handleSubmit} loading={isSubmitting}>
                    Activate
                  </Button>
                }
              />
            </Form>
          )}
        </Formik>
      </Card.Section>
    </Card>
  );
}
