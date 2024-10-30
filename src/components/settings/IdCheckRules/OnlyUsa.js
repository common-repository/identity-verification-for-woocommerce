import React, { useState, useCallback } from "react";
import Toggle from "react-toggle";
import { useFormikContext } from "formik";
import { Flex, Box } from "rebass";
import { ChoiceList, Autocomplete, Icon, Tag } from "@shopify/polaris";
import without from "lodash/without";
import { SearchMajor } from "@shopify/polaris-icons";
import {
  usStatesOptions as baseUsStatesOptions,
  getUsStateLabel,
} from "utils/geography";

export default function OnlyUsa({}) {
  const [usStateSearchTerm, setUsStateSearchTerm] = useState("");
  const [usStatesOptions, setUsStatesOptions] = useState(baseUsStatesOptions);
  const { values, setFieldValue } = useFormikContext();

  const updateUsStateSearchTerm = useCallback(
    (value) => {
      setUsStateSearchTerm(value);
      // if seach term is empty, reset the filter
      if (value === "") {
        setUsStatesOptions(baseUsStatesOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = baseUsStatesOptions.filter((option) =>
        option.label.match(filterRegex)
      );
      setUsStatesOptions(resultOptions);
    },
    [baseUsStatesOptions]
  );

  return (
    <>
      <Flex justifyContent="flex-start" alignItems="center">
        <Box my={4} mx={3} display="flex" alignItems="center">
          <Toggle
            checked={values.checkOnlyUsa}
            onChange={(e) => {
              setFieldValue("checkOnlyUsa", e.target.checked);
              // the initial render on a new store doesn't have this value by default, need to save it
              setFieldValue("usStateSpecificity", values.usStateSpecificity);
            }}
          />
        </Box>
        <Box>Require ID verification for orders shipping to the USA</Box>
      </Flex>

      {values.checkOnlyUsa && (
        <Box px={[0, 5]}>
          <ChoiceList
            title=""
            choices={[
              {
                label: "All states within the U.S.",
                value: "all_usa",
              },
              {
                label:
                  "Only require ID verification for orders to be shipped to specific states",
                value: "only_us_states",
                renderChildren: (isSelected) =>
                  isSelected && (
                    <>
                      <Flex my={2} flexWrap="wrap">
                        {values.requiredIdUsStates.map((state) => (
                          <Flex key={state} m={1}>
                            <Tag
                              key={state}
                              onRemove={() => {
                                const newUsStatesList = without(
                                  values.requiredIdUsStates,
                                  state
                                );
                                setFieldValue(
                                  "requiredIdUsStates",
                                  newUsStatesList
                                );
                              }}
                            >
                              {getUsStateLabel(state)}
                            </Tag>
                          </Flex>
                        ))}
                      </Flex>
                      <Autocomplete
                        allowMultiple
                        textField={
                          <Autocomplete.TextField
                            onChange={updateUsStateSearchTerm}
                            label="U.S. States"
                            value={usStateSearchTerm}
                            placeholder="Search U.S. states"
                          />
                        }
                        options={usStatesOptions}
                        selected={values.requiredIdUsStates}
                        onSelect={(selected) => {
                          setFieldValue("requiredIdUsStates", selected);
                        }}
                        prefix={<Icon source={SearchMajor} color="base" />}
                        placeholder="Search U.S. states"
                      />
                    </>
                  ),
              },
            ]}
            selected={[values.usStateSpecificity]}
            onChange={(choice) => {
              setFieldValue("usStateSpecificity", choice[0]);
            }}
          />
        </Box>
      )}
    </>
  );
}
