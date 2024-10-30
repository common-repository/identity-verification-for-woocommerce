import React from "react";
import styled from "styled-components";
import { Subheading, TextStyle, Heading } from "@shopify/polaris";
import { Flex, Box } from "rebass";

const Wrapper = styled(Box)`
  h2 {
    text-align: center;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 1.1px;
  }
  * {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :focus {
    outline: none;
  }
  width: 50%;
  min-height: 150px;
  border: ${(props) =>
    props.selected ? "5px solid #50B83C" : "5px solid #CECECE"};
  border-radius: 0.5em;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  svg {
    width: 7em;
    height: 50px;
    display: block;
  }
`;

const IconsSection = styled(Flex)`
  font-size: 3em;
  font-weight: 700;
`;

export default function IdCheckOption({
  onClick,
  helperText,
  subtitle,
  title,
  icons,
  selected,
}) {
  return (
    <Wrapper selected={selected} onClick={onClick} mx={1}>
      <Heading>{title}</Heading>
      <IconsSection justifyContent="center" alignItems="center">
        {icons}
      </IconsSection>
      <Subheading>{subtitle}</Subheading>
      <TextStyle variation="subdued">{helperText}</TextStyle>
    </Wrapper>
  );
}
