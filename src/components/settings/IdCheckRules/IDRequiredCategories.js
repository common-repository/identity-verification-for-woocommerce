import React, { useEffect, useState, useMemo } from "react";
import { Box, Flex } from "rebass";
import {
  Tabs,
  Card,
  ResourceItem,
  TextStyle,
  Badge,
  ResourceList,
  Filters,
  Icon,
  Pagination,
  Heading,
  SkeletonDisplayText,
  SkeletonBodyText,
} from "@shopify/polaris";
import Toggle from "react-toggle";
import { useFormikContext } from "formik";
import useDebounce from "hooks/useDebounce";
import get from "lodash/get";
import uniq from "lodash/uniq";
import clone from "lodash/clone";
import has from "lodash/has";
import { useToast } from "providers/ToastProvider";
import { CollectionsMajor } from "@shopify/polaris-icons";
import * as Sentry from "@sentry/react";
import { listCategories } from "../../../services/wpApi";

export default function RequiredIdCategories({}) {
  const setToast = useToast();
  const { values, setFieldValue } = useFormikContext();
  const [categories, setCategories] = useState([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const debouncedCategoryQuery = useDebounce(categoryQuery, 500);

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [tags, setTagss] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const debouncedTagsnQuery = useDebounce(tagQuery, 500);

  const [productsOrCollectionsNav, setProductsOrCollectionsNav] = useState(0);

  async function hydrateRequiredIdCategories(requiredIdCollections) {
    setLoading(true);

    listCategories({ requiredIdCollections, currentPage })
      .then(({ data, headers }) => {
        setTotalPages(headers["x-wp-totalpages"]);
        setCategories(data.map(clone));
        setLoading(false);
      })
      .catch((err) => {
        setToast(err);
        console.log(err);
        setLoading(false);
      });
  }

  // initial load, hydrate the required ID products with the photos and details from the GraphQL API
  useEffect(() => {
    // if there are blocked products, populate the resource list now
    if (
      values.requiredIdCategories.length > 0 &&
      has(values.requiredIdCategories[0], "isIdRequired")
    ) {
      hydrateRequiredIdCategories(values.requiredIdCategories);
    }
  }, [
    values.requiredIdCategories,
    values.requiredIdTags,
    values.requiredIdCategoriesEnabled,
  ]);

  // search for collections by name
  useEffect(() => {
    hydrateRequiredIdCategories();
  }, [debouncedCategoryQuery, currentPage]);

  // responsible for keeping track of which collections are or aren't on the list
  const categoriesMemo = useMemo(() => {
    return categories
      .filter((c) => c != null)
      .map((collection) => {
        collection.isIdRequired = values.requiredIdCategories.includes(
          collection.id
        );
        return collection;
      });
  }, [
    categories,
    values.requiredIdCategories,
    values.requiredIdCategoriesEnabled,
  ]);

  return (
    <Box my={4}>
      <Card.Section title="Products Requiring ID verification">
        <Tabs
          tabs={[
            {
              id: "categories",
              content: (
                <span>
                  <Badge status="new">
                    {values.requiredIdCategoriesEnabled
                      ? values.requiredIdCategories.length
                      : 0}
                  </Badge>
                  Categories
                </span>
              ),
              accessibilityLabel: "ID required products categories",
              panelID: "products-content",
            },
            {
              id: "tags",
              content: (
                <span>
                  <Badge status="new">
                    {values.requiredIdCategoriesEnabled
                      ? values.requiredIdTags.length
                      : 0}
                  </Badge>
                  Tags
                </span>
              ),
              accessibilityLabel: "ID required product tags",
              panelID: "collections-content",
            },
          ]}
          selected={productsOrCollectionsNav}
          onSelect={(selection) => setProductsOrCollectionsNav(selection)}
          fitted
        >
          {productsOrCollectionsNav === 0 ? (
            <Card.Section title="Product Categories Requiring ID verification">
              <Flex alignItems="center" my={2} mx={3}>
                <Toggle
                  checked={values.requiredIdCategoriesEnabled}
                  onChange={(e) => {
                    setFieldValue(
                      "requiredIdCategoriesEnabled",
                      e.target.checked
                    );
                  }}
                />
                &nbsp;
                {values.requiredIdCategoriesEnabled ? (
                  <>
                    Categories requiring ID verification is&nbsp;
                    <strong>enabled</strong>
                  </>
                ) : (
                  <>
                    Categories requiring ID verification is&nbsp;
                    <strong>disabled</strong>
                  </>
                )}
              </Flex>
              {values.requiredIdCategoriesEnabled &&
                (loading ? (
                  <Flex flexDirection="column">
                    <Box my={3}>
                      <SkeletonDisplayText />
                      <SkeletonBodyText />
                    </Box>
                    <Box my={3}>
                      <SkeletonDisplayText />
                      <SkeletonBodyText />
                    </Box>
                    <Box my={3}>
                      <SkeletonDisplayText />
                      <SkeletonBodyText />
                    </Box>
                    <Box my={3}>
                      <SkeletonDisplayText />
                      <SkeletonBodyText />
                    </Box>
                  </Flex>
                ) : (
                  <>
                    <ResourceList
                      // filterControl={
                      //   <Filters
                      //     filters={[]}
                      //     appliedFilters={[]}
                      //     onClearAll={() => {}}
                      //     queryValue={categoryQuery}
                      //     onQueryChange={setCategoryQuery}
                      //     onQueryClear={() => {
                      //       setCategoryQuery("");
                      //     }}
                      //     totalItemsCount={categories.length}
                      //   />
                      // }
                      renderItem={(category) => {
                        return (
                          <ResourceItem
                            media={
                              <img
                                width="50px"
                                src={category?.image?.src || ""}
                              />
                            }
                            onClick={() => {
                              // if product is already on the list, remove it
                              if (
                                values.requiredIdCategories.includes(
                                  category.id
                                )
                              ) {
                                const newrequiredIdCategories =
                                  values.requiredIdCategories.filter(
                                    (p) => p != category.id
                                  );
                                setFieldValue(
                                  "requiredIdCategories",
                                  newrequiredIdCategories
                                );
                                setCategoryQuery("");
                              } else {
                                // if it is not on the list, add it
                                const newrequiredIdCategories = uniq([
                                  category.id,
                                  ...values.requiredIdCategories,
                                ]);

                                setFieldValue(
                                  "requiredIdCategories",
                                  newrequiredIdCategories
                                );
                                // setProductQuery("");
                              }
                            }}
                          >
                            <Heading>{category.name}</Heading>
                            <p>Contains {category.count} Products</p>
                            <p>{category.description}</p>
                            <Box my={3}>
                              <Badge
                                status={
                                  category.isIdRequired ? "success" : "default"
                                }
                              >
                                {category.isIdRequired
                                  ? "ID Verification Required"
                                  : "Not required"}
                              </Badge>
                            </Box>
                          </ResourceItem>
                        );
                      }}
                      items={categoriesMemo}
                    />
                    <Flex alignItems="center">
                      <Box mx={3}>
                        {currentPage} / {totalPages} pages
                      </Box>
                      <Pagination
                        hasPrevious={currentPage > 1}
                        onPrevious={() => {
                          setCurrentPage(currentPage - 1);
                        }}
                        hasNext={currentPage < totalPages}
                        onNext={() => {
                          setCurrentPage(currentPage + 1);
                        }}
                      />
                    </Flex>
                  </>
                ))}
            </Card.Section>
          ) : (
            <Card.Section title="Tags Requiring ID Verification">
              <Flex alignItems="center" my={2} mx={3}>
                Coming soon!
                {/* <Toggle
                  checked={values.requiredIdCollectionsEnabled}
                  onChange={(e) => {
                    setFieldValue(
                      "requiredIdCollectionsEnabled",
                      e.target.checked
                    );
                  }}
                />
                &nbsp;
                {values.requiredIdCollectionsEnabled ? (
                  <>
                    Collections requiring ID verification is &nbsp;
                    <strong>enabled</strong>
                  </>
                ) : (
                  <>
                    Collections requiring ID verification is &nbsp;
                    <strong>disabled</strong>
                  </>
                )} */}
              </Flex>
              {/* <ResourceList
                filterControl={
                  <Filters
                    filters={[]}
                    appliedFilters={[]}
                    onClearAll={() => {}}
                    queryValue={collectionQuery}
                    onQueryChange={setCollectionQuery}
                    onQueryClear={() => {
                      setCollectionQuery("");
                    }}
                    totalItemsCount={collections.length}
                  />
                }
                renderItem={(collection) => {
                  const imageUrl = get(collection, "image.transformedSrc");
                  return (
                    <ResourceItem
                      media={
                        imageUrl ? (
                          <img src={imageUrl} />
                        ) : (
                          <Box
                            sx={{
                              ".Polaris-Icon": {
                                width: "4rem",
                                height: "4rem",
                                fill: "rgb(99, 115, 129)",
                              },
                            }}
                          >
                            <Icon source={CollectionsMajor} />
                          </Box>
                        )
                      }
                      onClick={() => {
                        // if product is already on the list, remove it
                        if (
                          values.requiredIdCollections.includes(collection.id)
                        ) {
                          const newRequiredIdCollections =
                            values.requiredIdCollections.filter(
                              (p) => p != collection.id
                            );
                          api
                            .patch(
                              "/api/shop/settings/remove-required-id-collection",
                              {
                                collectionId: collection.id,
                              }
                            )
                            .then(({ data }) => {
                              setFieldValue(
                                "requiredIdCollections",
                                data.requiredIdCollections
                              );
                              setFieldValue(
                                "requiredIdCategories",
                                data.requiredIdCategories
                              );
                              // setCollections(data.settings.requiredIdCollections);
                              // setProducts(data.settings.requiredIdCategories); // update the list and remove the
                              // setToast(
                              //   `The products in the ${collection.title} collection do not require ID verification.`
                              // );
                            })
                            .catch((err) => {
                              Sentry.captureException(err);
                              setToast(
                                "Unable to remove this collection from requiring ID verification, please contact support."
                              );
                            });
                        } else {
                          // if it is not on the list, add it
                          const newRequiredIdCollections = uniq([
                            collection.id,
                            ...values.requiredIdCollections,
                          ]);
                          // api
                          //   .patch("/api/shop/settings", {
                          //     requiredIdCollections: newRequiredIdCollections,
                          //   })
                          //   .then(({ data }) => {
                          //      setCollections(data.settings.requiredIdCollections);
                          setFieldValue(
                            "requiredIdCollections",
                            newRequiredIdCollections
                          );
                          // setToast(
                          //   `The products in the ${collection.title} collection require ID verification.`
                          // );
                          // });
                        }
                      }}
                    >
                      <Flex
                        flexDirection="column"
                        justifyContent="space-between"
                      >
                        {collection.title}
                        <TextStyle variation="subdued">
                          Contains {collection.productsCount} products
                        </TextStyle>
                        {collection.isIdRequired && (
                          <Box my={3}>
                            <Badge status="success">
                              ID Verification Required
                            </Badge>
                          </Box>
                        )}
                      </Flex>
                    </ResourceItem>
                  );
                }}
                items={collectionsMemo}
              /> */}
            </Card.Section>
          )}
        </Tabs>
      </Card.Section>
    </Box>
  );
}
