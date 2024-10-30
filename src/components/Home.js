import React, { useEffect, useState, useRef } from "react";
import { Page, Icon } from "@shopify/polaris";
import { SettingsMajor } from "@shopify/polaris-icons";
import { useShop } from "providers/ShopProvider";
import { getChecks } from "services/wpApi";
import ChecksList from "components/checks/ChecksList";
import capitalize from "lodash/capitalize";
import useDebounce from "hooks/useDebounce";
import { useToast } from "providers/ToastProvider";
import { amplitudeEvent } from "components/initAmplitude";
import CreateCheckCalloutCard from "components/checks/CreateCheckCalloutCard";
import { Flex } from "rebass";
import { useHistory, useParams } from "react-router-dom";

export default function Home() {
  const history = useHistory();
  const urlParams = useParams();
  const [isLoadingChecks, setIsLoadingChecks] = useState(true);
  const [checks, setChecks] = useState([]);
  const [queryValue, setQueryValue] = useState(
    urlParams.search && urlParams.search !== "null" ? urlParams.search : null
  );
  const debouncedQueryValue = useDebounce(queryValue, 750);
  console.log("url params: ", urlParams);
  const [pagination, setPagination] = useState({
    page: parseInt(urlParams.page) || 0,
    totalVisits: 0,
    totalPages: 0,
    size: 0,
  });
  const previousPage = useRef(parseInt(urlParams.page));
  console.log("pagination: ", pagination);
  console.log("previousPage ", previousPage);

  const previousStatuses = useRef(urlParams.statuses);
  const [checkStatusesFilter, setCheckStatusesFilter] = useState(
    urlParams.statuses?.split(",") || [
      "in_progress",
      "in_review",
      "verified",
      "failed",
    ]
  );
  const { shop } = useShop();
  const setToast = useToast();

  useEffect(() => {
    if (!shop) {
      return;
    }

    getChecks({
      page: pagination.page,
      searchTerm: queryValue,
      checkStatuses: checkStatusesFilter,
    })
      .then(({ data }) => {
        const { page, totalChecks, totalPages, size } = data;
        setChecks(data.checks);
        setPagination({ page, totalChecks, totalPages, size });
        setIsLoadingChecks(false);
        amplitudeEvent("Homepage opened");
      })
      .catch((e) => {
        console.log(e);
        setToast("Unable to retrieve your ID checks at this time.");
      });
  }, [shop]);

  useEffect(() => {
    // console.log(previousPage.current, pagination.page);
    // if (previousPage.current == pagination.page) {
    //   return;
    // }

    setIsLoadingChecks(true);
    console.log(pagination);
    getChecks({
      searchTerm: debouncedQueryValue,
      page: pagination.page,
      checkStatuses: checkStatusesFilter,
    })
      .then((res) => {
        const { page, totalChecks, totalPages, size } = res.data;
        setChecks(res.data.checks);
        setIsLoadingChecks(false);
        setPagination({ page, totalPages, totalChecks, size });
      })
      .catch((err) => {
        console.log(err);
        setToast("Unable to retrieve your ID checks at this time.");
      });
  }, [debouncedQueryValue, pagination.page, checkStatusesFilter]);

  useEffect(() => {
    // if (pagination.page && pagination.page !== previousPage.current) {
    history.push(
      `/${!queryValue ? "null" : queryValue}/${checkStatusesFilter}/${
        pagination.page
      }`
    );
    // previousPage.current = pagination.page;
    // }
  }, [pagination.page, debouncedQueryValue, checkStatusesFilter]);

  const appliedIdCheckFilters = checkStatusesFilter.map((key) => {
    return {
      key,
      label: key.replace("_", " ").split(" ").map(capitalize).join(" "),
      onRemove: (status) => {
        setCheckStatusesFilter(
          checkStatusesFilter.filter((enabledStatus) => enabledStatus != status)
        );
      },
    };
  });

  return (
    <Page>
      <CreateCheckCalloutCard
        primaryAction={{
          content: "Create an ID check",
          onAction: () => {
            history.push("/new");
          },
        }}
        secondaryAction={{
          content: (
            <Flex alignItems="center">
              <Icon source={SettingsMajor} />
              &nbsp;Change ID check settings
            </Flex>
          ),
          onAction: () => {
            history.push("/settings");
          },
        }}
      />
      <ChecksList
        isLoadingChecks={isLoadingChecks}
        checks={checks}
        shop={shop}
        pagination={pagination}
        setPagination={setPagination}
        checkStatusesFilter={checkStatusesFilter}
        setCheckStatusesFilter={setCheckStatusesFilter}
        appliedIdCheckFilters={appliedIdCheckFilters}
        queryValue={queryValue}
        setQueryValue={setQueryValue}
      />
    </Page>
  );
}
