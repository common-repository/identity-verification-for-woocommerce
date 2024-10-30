import React, { useState } from "react";
import {
  Card,
  ResourceList,
  ChoiceList,
  ResourceItem,
  TextStyle,
  Badge,
  Filters,
  Icon,
  Pagination,
} from "@shopify/polaris";
import { Box, Flex } from "rebass";
import {
  PhoneInMajor,
  EmailMajor,
  SendMajor,
  ChevronRightMinor,
} from "@shopify/polaris-icons";
import { parseISO, format } from "date-fns";
import get from "lodash/get";
import StatusBadge from "components/checks/StatusBadge";
import { useHistory, useLocation } from "react-router-dom";

export default function ChecksList({
  checks,
  pagination,
  setPagination,
  isLoadingChecks,
  shop,
  checkStatusesFilter,
  setCheckStatusesFilter,
  appliedIdCheckFilters,
  queryValue,
  setQueryValue,
}) {
  const history = useHistory();
  return (
    <Card title="ID Checks">
      <ResourceList
        resourceName={{ singular: "ID Check", plural: "ID Checks" }}
        items={checks}
        loading={isLoadingChecks}
        idForItem={(check) => {
          return check.id;
        }}
        filterControl={
          <Filters
            filters={[
              {
                key: "checkStatus",
                label: "Status",
                filter: (
                  <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                      { label: "In Progress", value: "in_progress" },
                      { label: "In Review", value: "in_review" },
                      { label: "Verified", value: "verified" },
                      { label: "Failed", value: "failed" },
                    ]}
                    selected={checkStatusesFilter || []}
                    onChange={(statuses) => {
                      console.log("setting statuses to ", statuses);
                      setCheckStatusesFilter(statuses);
                    }}
                  />
                ),
                shortcut: true,
              },
              // {
              //   key: "archived",
              //   label: "Archived",
              //   filter: (
              //     <Checkbox
              //       label="Archived"
              //       checked={onlyArchivedFilter}
              //       onChange={() => setOnlyArchivedFilter(!onlyArchivedFilter)}
              //     />
              //   ),
              //   shortcut: true,
              // },
            ]}
            appliedFilters={appliedIdCheckFilters}
            onClearAll={() => {
              setQueryValue(null);
              // setCheckStatusesFilter([
              //   "in_progress",
              //   "verified",
              //   "failed",
              // ]);
            }}
            helpText="Search ID checks by order #, the customer's name, phone or email"
            queryValue={queryValue}
            onQueryChange={(value) => {
              setQueryValue(value);
            }}
            onQueryClear={() => {
              setQueryValue(null);
            }}
          >
            {/* <div style={{ paddingLeft: "8px" }}>
                    <Button onClick={() => console.log("New filter saved")}>
                      Save
                    </Button>
                  </div> */}
          </Filters>
        }
        renderItem={(check) => {
          return (
            <ResourceItem
              id={check.id}
              onClick={() => {
                history.push(`/checks/${check.id}`);
              }}
              style={{ marginBottom: "0" }}
            >
              <Flex alignItems="center">
                <Flex flexDirection="column" width={2 / 5}>
                  <h3 style={{ marginBottom: "3px" }}>
                    <TextStyle variation="strong">
                      {check.firstName && check.lastName
                        ? `${check.firstName} ${check.lastName}`
                        : "Unnamed Customer"}
                    </TextStyle>
                    &nbsp;
                  </h3>
                  {check.email && (
                    <Flex alignItems="center">
                      <Box width={15} height={15} mr={1}>
                        <Icon color="subdued" source={EmailMajor} />
                      </Box>
                      &nbsp;
                      <TextStyle variation="subdued">{check.email}</TextStyle>
                    </Flex>
                  )}
                  {check.phone && (
                    <Flex alignItems="center" mt={1}>
                      <Box mr={1} width={15} height={15}>
                        <Icon color="subdued" source={PhoneInMajor} />
                      </Box>
                      &nbsp;
                      <TextStyle variation="subdued">{check.phone}</TextStyle>
                    </Flex>
                  )}
                </Flex>

                <Flex flexDirection="column" width={2 / 5}>
                  {check.createdAt && (
                    <Flex alignItems="center" marginBottom={1}>
                      <Box mx={0} width={15} height={15}>
                        <Icon color="subdued" source={SendMajor} />
                      </Box>
                      &nbsp;
                      <TextStyle variation="subdued">
                        {format(parseISO(check.createdAt), "EEE. MMMM do yyyy")}
                      </TextStyle>
                    </Flex>
                  )}
                  <Flex alignItems="center">
                    <StatusBadge
                      step={check.step}
                      success={get(check, "job.result.success")}
                    />

                    {check.orderId && (
                      <Badge status="default" size="small">
                        Order {check.orderId}
                      </Badge>
                    )}

                    {check.signatureRequired && !check.signatureS3 && (
                      <Badge status="warning" size="small">
                        Signature Required
                      </Badge>
                    )}
                    {check.signatureRequired && check.signatureS3 && (
                      <Badge status="success" size="small">
                        Signature Provided
                      </Badge>
                    )}

                    {check.isUnderageCustomer && (
                      <Badge status="critical" size="small">
                        UNDERAGE
                      </Badge>
                    )}
                  </Flex>
                </Flex>

                <Icon source={ChevronRightMinor} color="base" />
              </Flex>
            </ResourceItem>
          );
        }}
      />
      {pagination.totalPages > 1 && (
        <Flex alignItems="center">
          <Box mr={2}>
            Page {pagination.page + 1} / {pagination.totalPages}
          </Box>
          <Pagination
            hasPrevious={pagination.page > 0}
            onPrevious={() => {
              setPagination({
                ...pagination,
                page: pagination.page - 1,
              });
            }}
            hasNext={pagination.page + 1 < pagination.totalPages}
            onNext={() => {
              setPagination({
                ...pagination,
                page: pagination.page + 1,
              });
            }}
          />
        </Flex>
      )}
    </Card>
  );
}
