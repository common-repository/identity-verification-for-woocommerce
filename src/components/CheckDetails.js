import {
  Page,
  Frame,
  Card,
  ChoiceList,
  TextField,
  Layout,
  DescriptionList,
  Subheading,
  Modal,
  TextStyle,
  FormLayout,
  Button,
  Icon,
  Badge,
  Banner,
  TextContainer,
  SkeletonBodyText,
  Link,
  Heading,
  SkeletonPage,
  SkeletonDisplayText,
  Checkbox,
} from "@shopify/polaris";
import { ClipboardMinor, LinkMinor } from "@shopify/polaris-icons";
import StatusBadge from "components/checks/StatusBadge";
import React, { useState, useEffect, useContext } from "react";
import get from "lodash/get";
import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import {
  Timeline,
  TimelineEvent as BaseTimelineEvent,
} from "react-event-timeline";
import { parseISO, format } from "date-fns";
import { Flex, Box, Image } from "rebass";
import countries from "components/countries_fields";
import Stepper from "react-stepper-horizontal";
import { isEmail, isMobilePhone as isPhone } from "validator";
import { RiDeleteBinFill } from "react-icons/ri";
import { BiMessageRoundedError } from "react-icons/bi";
import { ImCheckboxChecked } from "react-icons/im";
import { HiRefresh as NewCheckIcon } from "react-icons/hi";
import { FaWindowClose } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { amplitudeEvent } from "components/initAmplitude";
import IdScanAnimation from "components/IdScanAnimation";
import { useToast } from "providers/ToastProvider";
import { useShop } from "providers/ShopProvider";
import {
  getCheck,
  createCheck,
  manuallyApproveCheck,
  manuallyRejectCheck,
  deliverCheckReminder,
  deleteCheckData,
  getOrder,
} from "services/wpApi";
import { useParams, useHistory } from "react-router-dom";
import styled from "styled-components";

const TimelineEvent = styled(BaseTimelineEvent)`
  font-size: 1em;
`;

const StepperWrapper = styled.div`
  margin-bottom: 2rem;
`;
export default function Check() {
  const [isLoading, setIsLoading] = useState(true);
  const [legacyOrderId, setLegacyOrderId] = useState("");
  const [check, setCheck] = useState({});
  const [checkUrlOpen, setCheckUrlOpen] = useState(false);
  const [sendNewCheckModalOpen, setSendNewCheckModalOpen] = useState(false);
  const [resendLinkModalOpen, setResendLinkModalOpen] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailWarning, setEmailWarning] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [confirmDeleteDataOpen, setConfirmDeleteDataOpen] = useState(false);
  const [confirmManualApprovalOpen, setConfirmManualApprovalOpen] =
    useState(false);
  const [confirmManualRejectionOpen, setConfirmManualRejectionOpen] =
    useState(false);
  const [createCheckPrompt, setCreateCheckPrompt] = useState(false);
  const [orderDetails, setOrderDetails] = useState(false);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(true);
  const { shop } = useShop();
  const setToastMessage = useToast();
  const { checkId } = useParams();
  const history = useHistory();
  const [order, setOrder] = useState(null);
  const [shouldCancelAndRefund, setShouldCancelAndRefund] = useState(false);

  const defaultPageActions = [
    {
      actionName: "link",
      content: (
        <Flex alignItems="center">
          <Icon source={LinkMinor} />
          &nbsp; ID Check Link
        </Flex>
      ),
      accessibilityLabel:
        "Get the ID Check link that was sent to your customer",
      onAction: () => {
        setCheckUrlOpen(true);
      },
    },
    {
      actionName: "approveCheck",
      content: (
        <Flex alignItems="center">
          <ImCheckboxChecked />
          &nbsp;Approve Check
        </Flex>
      ),
      accessibilityLabel: "Manually approve check",
      onAction: () => {
        setConfirmManualApprovalOpen(true);
      },
    },
    {
      actionName: "rejectCheck",
      content: (
        <Flex alignItems="center">
          <FaWindowClose />
          &nbsp;Reject Check
        </Flex>
      ),
      accessibilityLabel: "Manually reject check",
      onAction: () => {
        setConfirmManualRejectionOpen(true);
      },
    },
  ];
  const [pageSecondaryActions, setPageSecondaryActions] =
    useState(defaultPageActions);

  const deletePhotosButton = {
    actionName: "deletePhotos",
    content: (
      <Flex alignItems="center">
        <RiDeleteBinFill />
        &nbsp;Delete Customer Photos
      </Flex>
    ),
    accessibilityLabel: "Delete Customer ID & Headshot photos permanently",
    onAction: () => {
      setConfirmDeleteDataOpen(true);
    },
  };

  const sendReminderButton = {
    actionName: "sendReminder",
    content: (
      <Flex alignItems="center">
        <BiMessageRoundedError />
        &nbsp; Send Reminder
      </Flex>
    ),
    accessibilityLabel: "Open the form to resend the ID check link",
    onAction: () => {
      setResendLinkModalOpen(true);
    },
  };

  const sendNewCheckButton = {
    actionName: "resend",
    content: (
      <Flex alignItems="center">
        <NewCheckIcon />
        &nbsp; Send New ID Check
      </Flex>
    ),
    accessibilityLabel: "Resend a new ID check to this customers",
    onAction: () => {
      setSendNewCheckModalOpen(true);
    },
  };

  useEffect(() => {
    if (isEmpty(check)) {
      return;
    }

    setIsLoading(false);
  }, [check]);

  /**
   * Retrieve the check
   */
  useEffect(() => {
    if (!checkId && !legacyOrderId) {
      return;
    }

    if (checkId && checkId !== "from-order-details-page") {
      getCheck(checkId)
        .then((res) => {
          setCheck(get(res, "data.check"));
          setIsLoading(false);
          setPhone(get(res, "data.check.phone"));
          setEmail(get(res, "data.check.email"));
          setFirstName(get(res, "data.check.firstName"));
          setLastName(get(res, "data.check.lastName"));
          setDeliveryMethods([
            ...(check.email ? ["email"] : []),
            ...(check.phone ? ["phone"] : []),
          ]);
          amplitudeEvent("Opened check details page", {
            checkId,
            ...check,
          });
        })
        .catch((err) => {
          setToastMessage(
            "Unable to retrieve the check details. Please refresh the page."
          );
          Sentry.captureException(err);
          console.log(err);
        });
    } else {
      api
        .get(`/api/checks/from-legacy-order-id/${legacyOrderId}`)
        .then((res) => {
          setCheckId(get(res, "data.check.id"));
          setCheck(get(res, "data.check"));
          setIsLoading(false);
          setPhone(get(res, "data.check.phone"));
          setEmail(get(res, "data.check.email"));
          setFirstName(get(res, "data.check.firstName"));
          setLastName(get(res, "data.check.lastName"));
          setDeliveryMethods([
            ...(check.email ? ["email"] : []),
            ...(check.phone ? ["phone"] : []),
          ]);
          amplitudeEvent("Opened view ID check from Shopify order admin page", {
            legacyOrderId,
            checkId,
            ...check,
          });
        })
        .catch((err) => {
          setToastMessage(
            <>
              No ID check is associated with this order. Redirecting you to a
              new page where you can make one.
            </>
          );

          amplitudeEvent(
            "Opened view ID check from Shopify order admin page - new check redirect",
            {
              legacyOrderId,
            }
          );
          redirect.dispatch(Redirect.Action.APP, "/checks/new");
          console.log(err);
        });
    }
  }, [checkId, legacyOrderId]);

  /**
   * Retrieve the order
   */
  useEffect(() => {
    if (!check || !check?.wcOrderId) {
      return;
    }

    getOrder(check.wcOrderId)
      .then(({ data }) => setOrder(data))
      .catch((e) => {
        console.log(e);
      });
  }, [check]);

  useEffect(() => {
    let toBeAdded = [];
    // if photos are present, then add the delete photos button option
    if (
      (check.userPhoto || check.idPhoto) &&
      !pageSecondaryActions
        .map((action) => action.actionName)
        .includes("deletePhotos")
    ) {
      toBeAdded = [...toBeAdded, deletePhotosButton];
    }

    if (!["completed", "in_review"].includes(check.step)) {
      toBeAdded = [...toBeAdded, sendReminderButton];
    }

    // if (["completed", "in_review"].includes(check.step)) {
    toBeAdded = [...toBeAdded, sendNewCheckButton];
    // }

    setPageSecondaryActions([...defaultPageActions, ...toBeAdded]);
  }, [check]);

  function deliverCheck() {
    deliverCheckReminder(checkId, {
      deliveryMethods,
      phone,
      email,
      firstName,
      lastName,
    })
      .then((res) => {
        // trigger Toast
        setToastMessage(res.data.message);
        setResendLinkModalOpen(false);
        // we'll let the websockets handle pushing the newest event
      })
      .catch((err) => {
        // trigger bad Toast
        setToastMessage(
          get(
            err,
            "response.data.message",
            "There was an error when trying to send a reminder to this customer."
          )
        );
      });
  }

  function sendNewCheck() {
    const {
      firstName,
      lastName,
      orderId,
      wcOrderId,
      wcCustomerId,
      triggeredRules,
    } = check;
    createCheck({
      deliveryMethods,
      phone,
      email,
      firstName,
      lastName,
      orderId,
      wcOrderId,
      wcCustomerId,
      triggeredRules,
      source: "resendIdCheck",
    })
      .then((res) => {
        // trigger Toast
        setToastMessage("Sent a new ID check.");
        history.push(`/checks/${res.data.check.id}`);
      })
      .catch((err) => {
        console.log(err);
        // trigger bad Toast
        setToastMessage(
          get(
            err,
            "response.data.message",
            "There was an error when trying to send a new ID check to this customer."
          )
        );
      });
  }

  function hydrateCountry(country) {
    countries.reduce((sum, value) => {
      if (value.value == country) {
        return value;
      }

      return false;
    }, false);
  }

  const getApplicantName = () => {
    return check.firstName && check.lastName
      ? `${check.firstName} ${check.lastName}`
      : "Unnamed Customer";
  };

  function generateSteps() {
    let baseSteps = [
      { title: "Delivered" },
      { title: "Opened" },
      { title: "Submitted ID" },
      { title: "Submitted Headshot" },
      { title: "Completed" },
    ];

    if (check.idCheckType == "id") {
      baseSteps = baseSteps.filter(
        (step) => !["Submitted Headshot", "Face Match"].includes(step.title)
      );
    }

    if (check.source == "pre-checkout") {
      baseSteps = baseSteps.filter((step) => step.title !== "Delivered");
    }

    if (
      check.step === "in_review" &&
      !baseSteps.some((step) => step.title === "In Review")
    ) {
      baseSteps.splice(-1, 0, { title: "In Review" });
    }

    return baseSteps;
  }

  function getCurrentStep() {
    let defaultSteps = [
      "delivered",
      "opened",
      "id",
      "face_match", // personally I don't think this step exists...it seems like it skips from "id" to "face_match"
      "completed",
    ];

    if (check.step == "in_review" && !defaultSteps.includes("in_review")) {
      defaultSteps.splice(-1, 0, "in_review");
    }

    return defaultSteps.indexOf(check.step);
  }

  return (
    <Frame>
      {isLoading || isEmpty(check) ? (
        <SkeletonPage secondaryActions={2} fullWidth>
          <Layout>
            <Layout.Section>
              <Card>
                <SkeletonDisplayText size="large" />
                <SkeletonBodyText lines={10} />
              </Card>
              <Card>
                <SkeletonDisplayText size="large" />
                <SkeletonBodyText lines={10} />
              </Card>
              <Card>
                <SkeletonDisplayText size="large" />
                <SkeletonBodyText lines={10} />
              </Card>
            </Layout.Section>
          </Layout>
        </SkeletonPage>
      ) : (
        <>
          <Page
            breadcrumbs={[
              {
                content: "Checks",
                onAction: () => {
                  history.push("/");
                },
              },
            ]}
            title={getApplicantName()}
            titleMetadata={
              <StatusBadge
                step={check.step}
                success={get(check, "job.result.success")}
              />
            }
            subtitle={check.orderId && `ID check for order ${check.orderId}`}
            secondaryActions={pageSecondaryActions}
            separator
            // fullWidth={!!check.order}
          >
            <StepperWrapper>
              <Stepper activeStep={getCurrentStep()} steps={generateSteps()} />
            </StepperWrapper>
            <Layout>
              <Layout.Section>
                {get(check, "isUnderageCustomer", false) && (
                  <Banner title="Underage ID provided" status="critical">
                    <p>
                      This customer passed ID verification, however they have
                      failed to meet your store's minimum age requirements.
                    </p>
                    <p>
                      They were notified of this issue when they submitted their
                      ID for verification.
                    </p>
                    <p>
                      Real ID does not automatically cancel orders from underage
                      ID submissions.
                    </p>
                  </Banner>
                )}
                {get(check, "step", "incomplete") === "completed" &&
                  has(check, "job.result.success") &&
                  get(check, "job.result.success") && (
                    <Banner title="ID Check Passed" status="success">
                      <p>This ID has been verified.</p>
                      <p>
                        Review the authenticity scores & photos submitted by
                        this customer in the sections below.
                      </p>
                    </Banner>
                  )}
                {get(check, "step", "incomplete") === "completed" &&
                  has(check, "job.result.success") &&
                  !get(check, "job.result.success") && (
                    <Banner title="ID Check Failed" status="critical">
                      <p>
                        We could not definitively verify this ID. The warnings
                        for each area are listed in the check details.
                      </p>
                      <p>
                        We have not canceled this order automatically. We leave
                        fulfillment and cancellation up to your judgement.
                      </p>
                    </Banner>
                  )}
                {has(check, "idPhoto") ? (
                  <Card title="ID check results">
                    {has(check, "job.result.firstName") && (
                      <Card.Section>
                        <Subheading>Name</Subheading>
                        {`${get(check, "job.result.firstName")} ${get(
                          check,
                          "job.result.lastName"
                        )}`}
                      </Card.Section>
                    )}
                    {!check?.job?.result?.idAddress &&
                      check?.job?.result?.unverifiedIdAddress && (
                        <Card.Section title="Address">
                          {check?.job?.result?.unverifiedIdAddress.map(
                            (line, index) => (
                              <p key={index}>{line}</p>
                            )
                          )}
                        </Card.Section>
                      )}
                    {check?.job?.result?.idAddress && (
                      <Card.Section title="Address">
                        {`${get(
                          check,
                          "job.result.idAddress.streetNumber"
                        )} ${get(check, "job.result.idAddress.street", "")}`}
                        {has(check, "job.result.idAddress.unit") && (
                          <>
                            <br />
                            {check.job.result.idAddress.unit}
                          </>
                        )}
                        {has(check, "job.result.idAddress.city") && (
                          <>
                            <br />
                            {`${check.job.result.idAddress.city}, ${check.job.result.idAddress.state} ${check.job.result.idAddress.postalCode}`}
                          </>
                        )}
                        {has(check, "job.result.idAddress.country") &&
                          hydrateCountry(
                            check.job.result.idAddress.country
                          ) && (
                            <>
                              <br />
                              <Flex alignItems="center">
                                <img
                                  src={`https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_50/v1591141085/Country%20Flags/${hydrateCountry(
                                    check.job.result.idAddress.country
                                  )
                                    .title.toLowerCase()
                                    .replace(/ /g, "-")}.png`}
                                />
                                {check.job.result.idAddress.country}
                              </Flex>
                            </>
                          )}
                      </Card.Section>
                    )}
                    <Card.Section title="ID Document">
                      {get(check, "job.errors", [])
                        .map((error) => error.type)
                        .includes("InvalidIdPhotoError") && (
                        <Banner
                          title="Invalid or Unrecognized ID Document"
                          status="critical"
                        >
                          <p>
                            We cannot determine the authenticity or type of ID
                            document provided.
                          </p>
                          <p>
                            This means that the ID could be valid, but we don't
                            recognize it.
                          </p>
                          <p>
                            To see our the full list of supported ID documents,
                            please visit our{" "}
                            <a
                              href="https://getverdict.com/real-id/faq/"
                              target="_blank"
                            >
                              FAQ page
                            </a>
                          </p>
                        </Banner>
                      )}

                      {get(check, "job.errors", [])
                        .map((error) => error.type)
                        .includes("LastNameCrossCheckFailed") && (
                        <Banner title="Mismatching names" status="critical">
                          {has(
                            check,
                            "crossCheckCustomerLastNameResult.verdict"
                          ) ? (
                            <>
                              <TextContainer>
                                <p>
                                  The name on the ID does not match the name of
                                  the customer on the order.
                                </p>
                                <p>
                                  This is not an outright signal for fraud, but
                                  consider it when deciding the legitimacy of
                                  the order.
                                </p>
                              </TextContainer>
                              {has(
                                check,
                                "crossCheckCustomerLastNameResult.confidence"
                              ) && (
                                <p>
                                  <Box my={3}>
                                    <TextStyle variation="strong">
                                      <>
                                        {(
                                          check.crossCheckCustomerLastNameResult
                                            .confidence * 100
                                        ).toFixed(2)}
                                        %
                                      </>
                                    </TextStyle>{" "}
                                    confident the names do not match
                                  </Box>
                                </p>
                              )}
                              <DescriptionList
                                items={[
                                  {
                                    term: "Name on the shipping address",
                                    description:
                                      get(
                                        check,
                                        "shopifyOrder.data.order.customer.firstName"
                                      ) +
                                      " " +
                                      get(
                                        check,
                                        "shopifyOrder.data.order.customer.lastName"
                                      ),
                                  },
                                  {
                                    term: "Name on the ID document",
                                    description:
                                      get(check, "job.result.firstName") +
                                      " " +
                                      get(check, "job.result.lastName"),
                                  },
                                ]}
                              />
                            </>
                          ) : (
                            <>
                              <p>
                                The name on the ID does not match the name of
                                the customer on the order.
                              </p>
                              <p>
                                This is not an outright signal for fraud, but
                                consider it when deciding the legitimacy of the
                                order.
                              </p>
                              <DescriptionList
                                items={[
                                  {
                                    term: "Name on the shipping address",
                                    description:
                                      get(
                                        check,
                                        "shopifyOrder.data.order.customer.firstName"
                                      ) +
                                      " " +
                                      get(
                                        check,
                                        "shopifyOrder.data.order.customer.lastName"
                                      ),
                                  },
                                  {
                                    term: "Name on the ID document",
                                    description:
                                      get(check, "job.result.firstName") +
                                      " " +
                                      get(check, "job.result.lastName"),
                                  },
                                ]}
                              />
                            </>
                          )}
                        </Banner>
                      )}

                      {get(check, "job.errors", [])
                        .map((error) => error.type)
                        .includes("ShippingAddressCrossCheckFailed") && (
                        <Banner
                          title="Mismatching shipping to ID addresses"
                          status="critical"
                        >
                          <TextContainer>
                            <p>
                              The address on the ID does not match the shipping
                              address on the order.
                            </p>
                            <p>
                              This is not an outright signal for fraud, but
                              consider it when deciding the legitimacy of the
                              order.
                            </p>
                          </TextContainer>
                          {has(
                            check,
                            "crossCheckShippingAddressResult.confidence"
                          ) && (
                            <p>
                              <Box my={3}>
                                <TextStyle variation="strong">
                                  <>
                                    {(
                                      check.crossCheckShippingAddressResult
                                        .confidence * 100
                                    ).toFixed(2)}
                                    %
                                  </>
                                </TextStyle>{" "}
                                Confidence
                              </Box>
                            </p>
                          )}
                          <DescriptionList
                            items={[
                              {
                                term: "Shipping Address",
                                description: (
                                  <TextContainer spacing="tight">
                                    <p>
                                      {get(
                                        check,
                                        "shopifyOrder.data.order.shippingAddress.address1"
                                      )}
                                    </p>
                                    <p>
                                      {get(
                                        check,
                                        "shopifyOrder.data.order.shippingAddress.city"
                                      )}
                                      &nbsp;
                                      {get(
                                        check,
                                        "shopifyOrder.data.order.shippingAddress.provinceCode"
                                      )}
                                    </p>
                                  </TextContainer>
                                ),
                              },
                              {
                                term: "ID document address",
                                description: (
                                  <TextContainer spacing="tight">
                                    {!get(check, "job.result.idAddress") && (
                                      <>
                                        We could not read the address from this
                                        document.
                                      </>
                                    )}
                                    <p>
                                      {get(
                                        check,
                                        "job.result.idAddress.streetNumber"
                                      )}
                                      &nbsp;
                                      {get(
                                        check,
                                        "job.result.idAddress.street"
                                      )}
                                    </p>
                                    <p>
                                      {get(check, "job.result.idAddress.city")}
                                      &nbsp;
                                      {get(check, "job.result.idAddress.state")}
                                    </p>
                                  </TextContainer>
                                ),
                              },
                            ]}
                          />
                        </Banner>
                      )}

                      {get(check, "job.errors", [])
                        .map((error) => error.type)
                        .includes("ExpiredIdError") && (
                        <Banner title="Expired ID Document" status="critical">
                          <TextContainer>
                            <p>
                              The customer provided an expired ID during their
                              ID check.
                            </p>
                            <p>
                              This means that the ID could be valid, but it is
                              not longer up to date.
                            </p>
                          </TextContainer>
                        </Banner>
                      )}
                      {has(check, "job.result.confidences.id") && (
                        <Layout.Section>
                          <Box my={3}>
                            <TextStyle variation="strong">
                              <>
                                {(
                                  get(
                                    check,
                                    "job.result.confidences.id",
                                    get(
                                      check,
                                      "job.result.confidences.idQuality"
                                    )
                                  ) * 100
                                ).toFixed(2)}
                                %
                              </>
                            </TextStyle>{" "}
                            Confident of Authenticity
                          </Box>
                        </Layout.Section>
                      )}
                      {get(check, "job.result.type") == "drivers-license" && (
                        <Layout.Section>
                          <DescriptionList
                            items={[
                              {
                                term: "Birth Date",
                                description: (
                                  <>
                                    {check.job.result.birthDate}
                                    {check.isUnderageCustomer && (
                                      <Badge size="medium" status="critical">
                                        UNDERAGE
                                      </Badge>
                                    )}
                                  </>
                                ),
                              },
                              {
                                term: "Expiration Date",
                                description: check.job.result.expireDate,
                              },
                              {
                                term: "Issue Date",
                                description: check.job.result.issueDate,
                              },
                              {
                                term: "Class",
                                description: check.job.result.class
                                  ? check.job.result.class
                                  : "N/A",
                              },
                            ]}
                          />
                        </Layout.Section>
                      )}
                      {has(check, "idPhoto") && (
                        <Layout.Section>
                          <Flex justifyContent="center">
                            <Image
                              src={check.idPhoto}
                              sx={{ maxHeight: "800px", objectFit: "contain" }}
                              className={check.sandboxMode && "blur"}
                            />
                          </Flex>
                        </Layout.Section>
                      )}
                    </Card.Section>
                    {has(check, "backIdPhoto") && (
                      <Card.Section title="Back of ID">
                        <Layout.Section>
                          <Flex justifyContent="center">
                            <Image
                              src={check.backIdPhoto}
                              sx={{ maxHeight: "800px", objectFit: "contain" }}
                              className={check.sandboxMode && "blur"}
                            />
                          </Flex>
                        </Layout.Section>
                      </Card.Section>
                    )}
                    {check.userPhoto && (
                      <Card.Section title="Headshot">
                        <Layout.Section>
                          {get(check, "job.errors", [])
                            .map((error) => error.type)
                            .includes("FaceMatchError") && (
                            <Banner
                              title="Face Matching Check Failed"
                              status="critical"
                            >
                              <TextContainer>
                                <p>
                                  We could not definitively match the face in
                                  the provided ID document with the
                                  corresponding headshot.
                                </p>
                                <p>
                                  This means that the customer could be using
                                  someone elses ID document in their ID check,
                                  or the photo quality of their photos is not
                                  high enough quality for us to confidently pass
                                  them.
                                </p>
                              </TextContainer>
                            </Banner>
                          )}
                          {has(check, "job.result.confidences.selfie") && (
                            <Box my={3}>
                              <TextStyle variation={"strong"}>
                                <>
                                  {(
                                    get(
                                      check,
                                      "job.result.confidences.selfie"
                                    ) * 100
                                  ).toFixed(2)}
                                  %
                                </>
                              </TextStyle>{" "}
                              Confident of Authenticity
                            </Box>
                          )}
                        </Layout.Section>
                        <Flex justifyContent="center">
                          <Image
                            src={check.userPhoto}
                            sx={{ maxHeight: "800px", objectFit: "contain" }}
                            className={check.sandboxMode && "blur"}
                          />
                        </Flex>
                      </Card.Section>
                    )}
                    {has(check, "job.result.confidences.faceMatch") &&
                      has(check, "userPhoto") && (
                        <Card.Section title="Face Matching Confidence">
                          <Layout.Section>
                            <Box my={3}>
                              <TextStyle variation={"strong"}>
                                <>
                                  {(
                                    parseFloat(
                                      `${check?.job?.result?.confidences.faceMatch}`
                                    ) * 100
                                  ).toFixed(2)}
                                  %
                                </>
                              </TextStyle>
                              &nbsp;confident submitted ID matches the submitted
                              headshot
                            </Box>
                          </Layout.Section>
                        </Card.Section>
                      )}
                    {has(check, "signature") && (
                      <Card.Section title="E-Signature">
                        <Flex justifyContent="center">
                          <img
                            src={check.signature}
                            alt="Customers signature"
                          />
                        </Flex>
                      </Card.Section>
                    )}
                  </Card>
                ) : (
                  <Card>
                    <Flex
                      height={525}
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      px={[2, 200]}
                      textAlign={["center", "left"]}
                    >
                      <Heading>
                        Waiting for the customer to submit their ID
                      </Heading>
                      <Box my={5}>
                        <IdScanAnimation />
                      </Box>
                      <TextStyle variation="subdued">
                        The customer hasn't provided their ID for verification
                        yet. You will receive an email notification when the
                        check is complete.
                      </TextStyle>
                    </Flex>
                  </Card>
                )}
              </Layout.Section>

              {check.orderGraphId && orderDetails && (
                <Layout.Section secondary>
                  {orderDetailsLoading ? (
                    <SkeletonBodyText />
                  ) : (
                    <Card
                      title={
                        <Link
                          onClick={() => {
                            redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
                              name: Redirect.ResourceType.Order,
                              newContext: true,
                              resource: {
                                id: orderDetails.legacyResourceId,
                              },
                            });
                          }}
                        >
                          <Heading>Order {check.orderId}</Heading>
                        </Link>
                      }
                    >
                      {has(orderDetails, "customer") && (
                        <Card.Section title="Customer">
                          <Link
                            onClick={() => {
                              redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
                                name: Redirect.ResourceType.Customer,
                                newContext: true,
                                resource: {
                                  id: orderDetails.customer.legacyResourceId,
                                },
                              });
                            }}
                          >
                            {get(orderDetails, "customer.firstName")}{" "}
                            {get(orderDetails, "customer.lastName")}
                          </Link>
                          {has(orderDetails, "customer.email") && (
                            <>
                              <br />
                              {get(orderDetails, "customer.email")}
                            </>
                          )}
                          {has(orderDetails, "customer.phone") && (
                            <>
                              <br />
                              {get(orderDetails, "customer.phone")}
                            </>
                          )}
                        </Card.Section>
                      )}
                      {has(orderDetails, "shippingAddress.formatted") && (
                        <Card.Section title="Shipping Address">
                          {get(
                            orderDetails,
                            "shippingAddress.formatted",
                            []
                          ).map((line) => (
                            <React.Fragment key={line}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                        </Card.Section>
                      )}
                      {has(orderDetails, "billingAddress") && (
                        <Card.Section title="Billing Address">
                          {orderDetails.billingAddressMatchesShippingAddress ? (
                            <TextStyle variation="subdued">
                              Same as shipping address.
                            </TextStyle>
                          ) : (
                            get(
                              orderDetails,
                              "billingAddress.formatted",
                              []
                            ).map((line) => (
                              <React.Fragment key={line}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))
                          )}
                        </Card.Section>
                      )}
                      {has(
                        orderDetails,
                        "totalPriceSet.shopMoney.currencyCode"
                      ) && (
                        <Card.Section title="Total Price">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency:
                              orderDetails.totalPriceSet.shopMoney.currencyCode,
                          }).format(
                            orderDetails.totalPriceSet.shopMoney.amount
                          )}
                        </Card.Section>
                      )}
                    </Card>
                  )}
                </Layout.Section>
              )}
            </Layout>
            <div id="timeline">
              <Timeline>
                {/* use slice & reverse to reverse the order of events */}
                {check.events &&
                  check.events
                    .slice(0)
                    .reverse()
                    .map((event) => {
                      return (
                        <TimelineEvent
                          key={event.at}
                          // title={event.title}
                          title=""
                          createdAt={format(
                            parseISO(event.at),
                            "MMM do y K:mm bbbb"
                          )}
                        >
                          {event.message}
                        </TimelineEvent>
                      );
                    })}
              </Timeline>
            </div>
            <Modal
              open={confirmDeleteDataOpen}
              onClose={() => {
                setConfirmDeleteDataOpen(false);
              }}
              title="Delete Customer Photos"
            >
              <Modal.Section>
                <FormLayout>
                  <Box my={2}>
                    <p>
                      Delete ID and Headshot photos belonging to this customer?
                    </p>
                    <p>
                      This action cannot be undone. The photos are deleted
                      permanently.
                    </p>
                  </Box>
                  <Button
                    destructive
                    onClick={() => {
                      deleteCheckData(checkId)
                        .then((res) => {
                          setToastMessage("Customers photos deleted.");
                          setCheck({ ...res.data });
                          setConfirmDeleteDataOpen(false);
                        })
                        .catch((err) => {
                          setToastMessage(
                            "Sorry, an error occurred while deleting these photos. Please notify support."
                          );
                        });
                    }}
                  >
                    Delete Photos
                  </Button>
                </FormLayout>
              </Modal.Section>
            </Modal>
            <Modal
              open={confirmManualApprovalOpen}
              onClose={() => {
                setConfirmManualApprovalOpen(false);
              }}
              title="Manually Approve ID Check"
            >
              <Modal.Section>
                <FormLayout>
                  <Box my={2}>
                    <TextContainer spacing="loose">
                      <p>
                        This will updating the ID check's status in the Real ID
                        app to complete.
                      </p>
                      {check.customerGraphId && (
                        <p>
                          In addition the{" "}
                          <Badge>ID check manually approved</Badge> tags will be
                          added to the customer & order in Shopify.{" "}
                          {get(
                            shop,
                            "settings.uniqueCustomersOnlyEnabled",
                            false
                          ) && (
                            <p>
                              This customer will not be required to provide
                              their ID on future orders.
                            </p>
                          )}
                        </p>
                      )}
                    </TextContainer>
                  </Box>
                  <Button
                    primary
                    onClick={() => {
                      manuallyApproveCheck(checkId)
                        .then((res) => {
                          setToastMessage("ID check approved.");
                          setCheck({ ...res.data });
                          setConfirmManualApprovalOpen(false);
                        })
                        .catch((err) => {
                          setToastMessage(
                            "Sorry, an error occurred while approving this customer's ID check manually. Please notify support."
                          );
                        });
                    }}
                  >
                    Approve ID Check
                  </Button>
                </FormLayout>
              </Modal.Section>
            </Modal>
            <Modal
              open={confirmManualRejectionOpen}
              onClose={() => {
                setConfirmManualRejectionOpen(false);
              }}
              title="Manually Reject ID Check"
            >
              <Modal.Section>
                <FormLayout>
                  <Box my={2}>
                    <TextContainer spacing="loose">
                      <p>This will updating the ID check's status to failed.</p>
                      {(check?.wcCustomerId || check?.wcOrderId) && (
                        <p>
                          In addition the customer and/or order{" "}
                          <code>real_id_check_status</code> meta will be updated
                          to
                          <code>manually_rejected</code>.
                        </p>
                      )}
                    </TextContainer>
                    {/* Only show this checkbox if the order is available */}
                    {check?.wcOrderId && (
                      <div className="ri-my-5">
                        <Checkbox
                          checked={shouldCancelAndRefund}
                          onChange={(checked) => {
                            console.log(checked);
                            setShouldCancelAndRefund(checked);
                          }}
                          label="Cancel and refund"
                          helpText="Immediately cancel and refund the entire amount of the order."
                        />
                      </div>
                    )}
                  </Box>
                  <Button
                    destructive
                    onClick={() => {
                      manuallyRejectCheck(checkId, {
                        wc_order_id: order?.id,
                        cancel_and_refund: shouldCancelAndRefund,
                      })
                        .then((res) => {
                          setToastMessage("ID check manually rejected.");
                          setCheck({ ...res.data });
                          setConfirmManualRejectionOpen(false);
                        })
                        .catch((err) => {
                          setToastMessage(
                            "Sorry, an error occurred while rejecting this customer's ID check manually. Please notify support."
                          );
                        });
                    }}
                  >
                    Reject ID Check
                  </Button>
                </FormLayout>
              </Modal.Section>
            </Modal>
          </Page>
        </>
      )}
      <Modal
        instant
        open={resendLinkModalOpen}
        onClose={() => {
          setResendLinkModalOpen(false);
        }}
        title="Resend the ID check link to this applicant"
        primaryAction={{
          content: "Resend ID check link",
          disabled:
            (phoneWarning && deliveryMethods.includes("sms")) ||
            (emailWarning && deliveryMethods.includes("email")) ||
            (deliveryMethods.includes("sms") && !phone) ||
            (deliveryMethods.includes("email") && !email) ||
            deliveryMethods.length == 0,
          onAction: () => {
            deliverCheck();
          },
        }}
      >
        <Modal.Section>
          <FormLayout.Group>
            <ChoiceList
              allowMultiple
              title="Choose an option to send the customer their ID verification link to"
              choices={[
                { label: "By SMS", value: "sms" },
                { label: "By Email", value: "email" },
              ]}
              selected={deliveryMethods}
              onChange={(value) => {
                setDeliveryMethods(value);
              }}
            />
          </FormLayout.Group>
          <FormLayout.Group>
            {deliveryMethods.includes("sms") && (
              <TextField
                label="Phone"
                type="phone"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                }}
                error={phoneWarning}
                onBlur={() => {
                  if (!phone && deliveryMethods.includes("sms")) {
                    setPhoneWarning(
                      "Sorry, need a valid phone number to send ID check instructions to."
                    );
                    return;
                  }

                  if (!isPhone(phone) && deliveryMethods.includes("sms")) {
                    setPhoneWarning(
                      "Sorry, need a valid phone number to send ID check instructions to."
                    );
                    return;
                  }

                  setPhoneWarning(false);
                }}
                helpText="We’ll use this phone number to send the ID check instructions to."
              />
            )}
          </FormLayout.Group>
          <FormLayout.Group>
            {deliveryMethods.includes("email") && (
              <TextField
                label="Email"
                type="email"
                value={email}
                error={emailWarning}
                onBlur={() => {
                  if (!email && deliveryMethods.includes("email")) {
                    setEmailWarning(
                      "Sorry, need a valid email address to continue"
                    );
                    return;
                  }
                  if (!isEmail(email) && deliveryMethods.includes("email")) {
                    setEmailWarning(
                      "Sorry, need a valid email address to continue."
                    );
                    return;
                  }

                  setEmailWarning(false);
                }}
                onChange={(value) => {
                  setEmail(value);
                }}
                helpText="We’ll use this email address to send the ID check instructions to."
              />
            )}
          </FormLayout.Group>
        </Modal.Section>
      </Modal>
      <Modal
        large
        instant
        open={sendNewCheckModalOpen}
        onClose={() => {
          setSendNewCheckModalOpen(false);
        }}
        title="Send new ID Check"
        primaryAction={{
          content: "Send new ID check",
          disabled:
            (phoneWarning && deliveryMethods.includes("sms")) ||
            (emailWarning && deliveryMethods.includes("email")) ||
            (deliveryMethods.includes("sms") && !phone) ||
            (deliveryMethods.includes("email") && !email) ||
            deliveryMethods.length == 0,
          onAction: () => {
            sendNewCheck();
          },
        }}
      >
        <Modal.Section>
          <Box my={3}>
            <TextContainer>
              <p>
                <TextStyle variation="subdued">
                  You can allow this customer to retry ID verification by
                  creating a new ID check.
                </TextStyle>
              </p>
              {check.orderGraphId && (
                <p>
                  <TextStyle variation="subdued">
                    This new ID check will still be associated with the order &
                    their profile.
                  </TextStyle>
                </p>
              )}

              <Banner status="info">
                This new check will be counted as a brand new ID check, a usage
                charge will apply.
              </Banner>
            </TextContainer>

            <FormLayout.Group>
              <ChoiceList
                allowMultiple
                title="Choose an option to send the customer their ID verification link to"
                choices={[
                  { label: "By SMS", value: "sms" },
                  { label: "By Email", value: "email" },
                ]}
                selected={deliveryMethods}
                onChange={(value) => {
                  setDeliveryMethods(value);
                }}
              />
            </FormLayout.Group>
            <FormLayout.Group>
              {deliveryMethods.includes("sms") && (
                <TextField
                  label="Phone"
                  type="phone"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                  }}
                  error={phoneWarning}
                  onBlur={() => {
                    if (!phone && deliveryMethods.includes("sms")) {
                      setPhoneWarning(
                        "Sorry, need a valid phone number to send ID check instructions to."
                      );
                      return;
                    }

                    if (!isPhone(phone) && deliveryMethods.includes("sms")) {
                      setPhoneWarning(
                        "Sorry, need a valid phone number to send ID check instructions to."
                      );
                      return;
                    }

                    setPhoneWarning(false);
                  }}
                  helpText="We’ll use this phone number to send the ID check instructions to."
                />
              )}
            </FormLayout.Group>
            <FormLayout.Group>
              {deliveryMethods.includes("email") && (
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  error={emailWarning}
                  onBlur={() => {
                    if (!email && deliveryMethods.includes("email")) {
                      setEmailWarning(
                        "Sorry, need a valid email address to continue"
                      );
                      return;
                    }
                    if (!isEmail(email) && deliveryMethods.includes("email")) {
                      setEmailWarning(
                        "Sorry, need a valid email address to continue."
                      );
                      return;
                    }

                    setEmailWarning(false);
                  }}
                  onChange={(value) => {
                    setEmail(value);
                  }}
                  helpText="We’ll use this email address to send the ID check instructions to."
                />
              )}
            </FormLayout.Group>
          </Box>
        </Modal.Section>
      </Modal>
      <Modal
        large
        instant
        open={checkUrlOpen}
        onClose={() => {
          setCheckUrlOpen(false);
        }}
        title="ID Check Link"
      >
        <Modal.Section>
          <Box my={3}>
            <Box my={3}>
              <p>
                Customer having trouble finding the link in their email? You can
                send them the link directly with the field below.
              </p>
            </Box>
            <TextField
              value={
                shop?.settings?.customFlowUrl
                  ? shop.settings.customFlowUrl.replace("{{checkId}}", checkId)
                  : `https://idv.link/${checkId}`
              }
              readOnly={true}
              label="ID Check Link"
              helpText="This is the same link that was sent to your customer"
              connectedRight={
                <CopyToClipboard
                  text={`https://idv.link/${checkId}`}
                  onCopy={() => setToastMessage("ID Check URL copied.")}
                >
                  <Button>
                    <Flex alignItems="center">
                      <Icon source={ClipboardMinor} />
                      &nbsp; Copy
                    </Flex>
                  </Button>
                </CopyToClipboard>
              }
            />
          </Box>
        </Modal.Section>
      </Modal>
    </Frame>
  );
}
