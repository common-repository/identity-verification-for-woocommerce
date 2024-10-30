import React, { useState, useRef, useEffect } from "react";
import { useToast } from "providers/ToastProvider";
import { Formik } from "formik";
import {
  Button,
  Page,
  Card,
  CalloutCard,
  TextContainer,
  TextStyle,
  Modal,
  FormLayout,
  Tooltip,
  TextField,
  ChoiceList,
  Link,
  Stack,
  Banner,
} from "@shopify/polaris";
import { createCheck, searchOrders } from "services/wpApi";
import * as yup from "yup";
import { Flex, Box } from "rebass";
import { renderContent } from "helpers";
import { CgExternal } from "react-icons/cg";
import PhoneInput from "components/checks/PhoneInput";
import { defaultCheckContent } from "constants";
import get from "lodash/get";
import { useShop } from "providers/ShopProvider";
import { useHistory } from "react-router-dom";
import "yup-phone";
import isEmail from "validator/lib/isEmail";
import isPhone from "validator/lib/isMobilePhone";
import capitalize from "lodash/capitalize";
import startCase from "lodash/startCase";
import { parseISO, formatDistanceToNow } from "date-fns";
import Currency from "./core/Currency";
import cx from "classnames";

export default function NewCheck() {
  const nameFieldsRef = useRef(null);
  const setToast = useToast();
  const shop = useShop();
  const [firstNameFieldFocus, setFirstNameFieldFocus] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContactError, setPreviewContactError] = useState("");
  const [previewSms, setPreviewSms] = useState("");
  const [previewEmail, setPreviewEmail] = useState("");
  const history = useHistory();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const scrollToRef = (ref) => {
    // ref.current.scrollIntoView({block: 'end'}
    window.scrollTo(0, ref.current.offsetTop);
  };

  useEffect(() => {
    // https://github.com/woocommerce/woocommerce/wiki/wc_get_orders-and-WC_Order_Query#parameters
    searchOrders({ page, limit: 3, orderby: "ID", order: "DESC" })
      .then(({ data: { orders, max_num_pages, total } }) => {
        setOrders(orders);
        setTotalPages(max_num_pages);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [page]);

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        content: get(shop, "settings.defaultContent", defaultCheckContent),
        selectedDeliveryMethods: [],
        wcOrderId: null,
        wcCustomerId: null,
        orderId: null,
      }}
      validationSchema={yup.object().shape({
        firstName: yup.string(),
        lastName: yup.string(),
        selectedDeliveryMethods: yup
          .array()
          .required("Pick one or more delivery methods")
          .min(1),
        email: yup.string().when("selectedDeliveryMethods", {
          is: (selectedDeliveryMethods) =>
            selectedDeliveryMethods.includes("email"),
          then: yup.string().email("Invalid email address"),
        }),
        phone: yup.string().when("selectedDeliveryMethods", {
          is: (selectedDeliveryMethods) =>
            selectedDeliveryMethods.includes("sms"),
          then: yup.string().phone(),
        }),
        content: yup.string(),
      })}
      onSubmit={(values, { setSubmitting }) => {
        let payload = values;
        if (!values.selectedDeliveryMethods.includes("sms")) {
          delete payload.phone;
        }
        if (!values.selectedDeliveryMethods.includes("email")) {
          delete payload.email;
        }

        createCheck(payload)
          .then(({ data }) => {
            setToast(data.message);
            setSubmitting(false);
            // redirect now
            history.push(`/checks/${data.check.id}`);
          })
          .catch((e) => {
            setToast("Unable to create an ID check");
            setSubmitting(false);
          });
      }}
    >
      {({
        setFieldValue,
        values,
        isSubmitting,
        errors,
        isValid,
        handleSubmit,
        handleBlur,
      }) => (
        <Page>
          <Card
            primaryAction={{
              content: "Start",
              onAction: () => {
                setFirstNameFieldFocus(true);
                scrollToRef(nameFieldsRef);
              },
            }}
          >
            <Card.Section>
              <div className="ri-mx-auto ri-py-3 ri-grid md:ri-grid-cols-2">
                <div className="ri-flex ri-flex-col ri-justify-center ri-mt-5">
                  <h1 className="ri-font-bold ri-text-xl ri-tracking-wide ri-mb-4">
                    Who would you like to verify?
                  </h1>
                  <p className="ri-mb-3">
                    Start by clicking an order to populate the contact
                    information for the ID check automatically.
                  </p>
                  <p>
                    Or skip selecting an order and send an ID check manually.
                  </p>
                </div>
                <img
                  className="ri-justify-self-end"
                  alt="Sending an ID check manually"
                  src="https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_350/v1628513381/Real%20ID/New%20Check%20Page/ID_verification_illustraction_shutterstock.png"
                />
              </div>
            </Card.Section>
          </Card>
          {/* <ProgressBar progress={0} size="large" /> */}
          <Card title="Recent orders">
            <Card.Section>
              <div className="ri-px-3 ri-my-3">
                <p>
                  Select a recent order below to associate the ID check with an
                  order.
                </p>
                <p
                  className="ri-underline"
                  onClick={() => {
                    setFirstNameFieldFocus(true);
                    scrollToRef(nameFieldsRef);
                  }}
                >
                  Alternatively, send an ID check to any email or phone number.
                </p>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={cx(
                      "ri-flex ri-justify-between ri-my-3 ri-px-6 ri-py-8 ri-space-y-4",
                      {
                        "ri-pointer-cursor hover:ri-border-blue-100 ri-border-1 ri-border-gray-100 ri-border-solid":
                          !selectedOrder,
                      },
                      {
                        "ri-border-2 ri-border-blue-300 ri-border-solid ri-shadow":
                          selectedOrder && selectedOrder?.id == order.id,
                      },
                      {
                        "ri-hidden":
                          selectedOrder && selectedOrder.id != order.id,
                      }
                    )}
                    onClick={() => {
                      setSelectedOrder(order);
                      setFieldValue("firstName", order?.billing?.first_name);
                      setFieldValue("lastName", order?.billing?.last_name);
                      setFieldValue("orderId", order.id);
                      setFieldValue("wcCustomerId", order.customer_id);
                      setFieldValue("wcOrderId", order.id);

                      if (order.billing?.email) {
                        setFieldValue("email", order.billing?.email);
                        setFieldValue("selectedDeliveryMethods", ["email"]);
                      }

                      setToast(`Selected order #${order.id} for ID check`);
                    }}
                  >
                    <div className="ri-flex-col">
                      <h3 className="ri-text-lg ri-text-grey-800 ri-my-2">
                        #{order.id}
                      </h3>
                      <p></p>
                      <p className="ri-text-grey-600">
                        {order.billing?.first_name} {order.billing?.last_name}
                      </p>
                      <p className="ri-text-blue-600 ri-underline">
                        {order.billing?.email}
                      </p>
                    </div>
                    <div className="ri-flex-col">
                      <div className="ri-p-3 ri-rounded ri-bg-gray-100 ri-border-1 ri-border-gray-200">
                        {startCase(order.status.replace("-", " "))}
                      </div>
                    </div>
                    <div className="ri-flex-col">
                      <div className="">
                        {formatDistanceToNow(
                          parseISO(order.date_created?.date)
                        )}{" "}
                        ago
                      </div>
                    </div>
                    <div className="">
                      <Currency
                        amount={order.total}
                        currencyCode={order.currency}
                      />
                    </div>
                  </div>
                ))}
                {totalPages > 0 && !selectedOrder && (
                  <div className="ri-px-3">
                    <div className="ri-my-5">
                      {page} / {totalPages}
                    </div>
                    <Button
                      disabled={page - 1 < 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={page + 1 > totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </Card.Section>
          </Card>
          <Card
            title="ID check applicant"
            primaryFooterAction={{
              content: "Start Check",
              onAction: handleSubmit,
              disabled: !isValid || isSubmitting,
              loading: isSubmitting,
            }}
            secondaryFooterActions={
              [
                // support once we have a corresponding WP endpoint and convert the form to formik
                // {
                //   content: "Preview",
                //   onAction: () => {
                //     setShowPreviewModal(true);
                //   },
                //   disabled: !isValid,
                // },
              ]
            }
          >
            <Card.Section title="Applicant name">
              <TextContainer>
                <p>
                  <TextStyle variation="subdued">
                    Manually fill out the details below to make an ID check that
                    is not associated with an order.
                  </TextStyle>
                </p>
              </TextContainer>
              <FormLayout>
                <div ref={nameFieldsRef}>
                  <FormLayout.Group>
                    <TextField
                      id="first-name"
                      label="First Name"
                      value={values.firstName}
                      onChange={(value) => {
                        setFieldValue("firstName", value);
                      }}
                      focused={firstNameFieldFocus}
                      onBlur={() => {
                        setFirstNameFieldFocus(false);
                      }}
                    />
                    <TextField
                      id="last-name"
                      label="Last Name"
                      value={values.lastName}
                      onChange={(value) => {
                        setFieldValue("lastName", value);
                      }}
                    />
                  </FormLayout.Group>
                </div>
              </FormLayout>
            </Card.Section>
            <Card.Section title="Delivery Method">
              <FormLayout.Group>
                <ChoiceList
                  allowMultiple
                  title="Choose an option to send the customer their ID verification link to"
                  choices={[
                    { label: "via Text Message", value: "sms" },
                    { label: "via Email", value: "email" },
                  ]}
                  selected={values.selectedDeliveryMethods}
                  onChange={(value) => {
                    setFieldValue("selectedDeliveryMethods", value);
                  }}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                {values.selectedDeliveryMethods.includes("sms") && (
                  <PhoneInput
                    phone={values.phone}
                    phoneWarning={errors.phone}
                    onChange={(value) => {
                      setFieldValue("phone", value);
                    }}
                    onBlur={handleBlur}
                  />
                )}
                {values.selectedDeliveryMethods.includes("email") && (
                  <TextField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={values.email}
                    error={errors.email}
                    onBlur={handleBlur}
                    onChange={(value) => {
                      setFieldValue("email", value);
                    }}
                    helpText="We’ll use this email address to send the ID check instructions to."
                  />
                )}
              </FormLayout.Group>
            </Card.Section>
            <Card.Section
              title="Message Content"
              // actions={[
              //   {
              //     content: (
              //       <Flex alignItems="center">
              //         <Icon source={PaintBrushMajor} />
              //         &nbsp; Edit Appearance
              //       </Flex>
              //     ),
              //     onAction: () => {
              //       setAppearanceSidebarOpen(true);
              //       Router.
              //     },
              //   },
              // ]}
            >
              <TextContainer>
                <p>
                  <TextStyle variation="subdued">
                    This content will appear in both the email and SMS message
                    but only for this ID check.
                  </TextStyle>
                </p>
              </TextContainer>
              {(values.selectedOrder ||
                values.firstName ||
                values.lastName) && (
                <>
                  <Box
                    sx={{
                      ".Polaris-TextContainer": {
                        my: 2,
                      },
                    }}
                  >
                    <TextContainer>
                      <p>
                        <TextStyle variation="subdued">
                          <strong>(Optional)</strong> Use the short codes below
                          to personalize the message sent to the customer and
                          include the order ID.
                        </TextStyle>
                      </p>
                      {!values.selectedOrder && (
                        <p>
                          <TextStyle variation="subdued">
                            There is currently no order selected, the{" "}
                            <code>[orderId]</code> shortcode will be empty.
                          </TextStyle>
                        </p>
                      )}
                    </TextContainer>
                  </Box>
                  <Flex
                    sx={{
                      button: {
                        mx: 2,
                      },
                    }}
                  >
                    {values.selectedOrder && (
                      <Tooltip
                        content={`The ID of the selected order (${values.selectedOrder})`}
                      >
                        <Button
                          onClick={() => {
                            setFieldValue(
                              "content",
                              values.content + " [orderId]"
                            );
                          }}
                        >
                          Order ID
                        </Button>
                      </Tooltip>
                    )}
                    {values.firstName && (
                      <Tooltip
                        content={`The customer's first name. (${values.firstName})`}
                      >
                        <Button
                          onClick={() => {
                            setFieldValue(
                              "content",
                              values.content + " [firstName]"
                            );
                          }}
                        >
                          First Name
                        </Button>
                      </Tooltip>
                    )}
                    {values.lastName && (
                      <Tooltip
                        content={`The customer's last name. (${values.lastName})`}
                      >
                        <Button
                          onClick={() => {
                            setFieldValue(
                              "content",
                              values.content + " [lastName]"
                            );
                          }}
                        >
                          Last Name
                        </Button>
                      </Tooltip>
                    )}
                  </Flex>
                </>
              )}
              <FormLayout.Group>
                <TextField
                  id="content"
                  label="Message content"
                  value={values.content}
                  onChange={(value) => {
                    setFieldValue("content", value);
                  }}
                  multiline={6}
                />
                <TextContainer>
                  Preview
                  <Box
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: "2.4rem",
                    }}
                  >
                    {renderContent(values.content, {
                      firstName: values.firstName,
                      lastName: values.lastName,
                      selectedOrder: values.selectedOrder,
                    })}
                  </Box>
                </TextContainer>
              </FormLayout.Group>
              <TextContainer>
                <p>
                  <TextStyle variation="subdued">
                    The customer's ID verification link will be automatically
                    added to this content.
                  </TextStyle>
                </p>
                {/* <Flex flexDirection="row" alignItems="center">
                  <Link onClick={() => {}} external>
                    Design the theme, branding and default content of your ID
                    checks in the settings page <CgExternal />
                  </Link>
                </Flex> */}
              </TextContainer>
            </Card.Section>
            {/* <Card.Section title="ID Check Requirements">
              <Subheading>ID Verification Level</Subheading>
              <Flex>
                <IdCheckOption
                  selected={idCheckType === "id"}
                  onClick={() => {
                    setIdCheckType("id");
                  }}
                  title="ID Only"
                  icons={<AiOutlineIdcard />}
                  subtitle="More convienent"
                  helperText="Only require a photo of the customer's valid ID. The ID will be scanned for authenticity."
                />
                <IdCheckOption
                  selected={idCheckType === "idv"}
                  onClick={() => {
                    setIdCheckType("idv");
                  }}
                  icons={
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      width={0.5}
                    >
                      <AiOutlineIdcard />
                      <TextStyle variation="subdued">+</TextStyle>
                      <BiFace />
                    </Flex>
                  }
                  title="ID and Headshot"
                  subtitle="More secure"
                  helperText="The face in the headshot will be cross referenced with the face photo on the ID document. Also includes the ID authenticity scan."
                />
              </Flex>
              <Flex mt={3} flexDirection="column">
                <SignatureRequired
                  checked={signatureRequired}
                  setChecked={setSignatureRequired}
                  shop={shop}
                />
              </Flex>
            </Card.Section> */}
          </Card>
          <Modal
            open={showPreviewModal}
            onClose={() => {
              setShowPreviewModal(false);
            }}
            title="Send a preview of the ID check message"
            primaryAction={{
              content: "Send Preview ID check",
              disabled: previewContactError,
              onAction: () => {
                api
                  .post("/api/checks/deliver/demo", {
                    deliveryMethods: selectedDeliveryMethods,
                    firstName,
                    lastName,
                    orderId: selectedOrder,
                    content,
                    previewEmail,
                    previewSms,
                  })
                  .then((res) => {
                    amplitudeEvent("Sent ID check preview", {
                      deliveryMethods: selectedDeliveryMethods,
                      firstName,
                      lastName,
                      orderId: selectedOrder,
                      content,
                      previewEmail,
                      previewSms,
                    });
                    setToastMessage("Preview ID check sent");
                  })
                  .catch((err) => {
                    setToastMessage(
                      "Sorry, failed to send a preview ID check. Please try again later."
                    );
                  });
              },
            }}
          >
            <Modal.Section>
              <Stack vertical>
                <Stack.Item>
                  <TextContainer>
                    <p>
                      You can preview the message sent to your customers. The
                      message will contain a preview of the content your
                      customers would see.
                    </p>
                    <Banner status="info">
                      The content in the message is the actual content sent to
                      the customer. However, the link to open the ID
                      verification check is non-functional.
                    </Banner>
                  </TextContainer>
                </Stack.Item>
                <Stack.Item fill>
                  <FormLayout.Group>
                    <PhoneInput
                      phone={previewSms}
                      onChange={(value) => {
                        setPreviewSms(value);
                      }}
                    />
                  </FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      label="Email"
                      type="email"
                      value={previewEmail}
                      onChange={(value) => {
                        setPreviewEmail(value);
                      }}
                      helpText="We’ll use this email address to send the ID check instructions to."
                    />
                  </FormLayout.Group>
                  {previewContactError && (
                    <TextStyle variation="negative">
                      {previewContactError}
                    </TextStyle>
                  )}
                </Stack.Item>
              </Stack>
            </Modal.Section>
          </Modal>
        </Page>
      )}
    </Formik>
  );
}
