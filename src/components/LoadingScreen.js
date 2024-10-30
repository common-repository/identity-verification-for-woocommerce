import React from "react";
import {
  SkeletonPage,
  TextContainer,
  Layout,
  Card,
  SkeletonDisplayText,
  SkeletonBodyText,
} from "@shopify/polaris";

export default function LoadingScreen(props) {
  return (
    <>
      {props.isLoading ? (
        <>
          <Layout.Section>
            <Card sectioned>
              <SkeletonBodyText />
            </Card>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </Card>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card>
              <Card.Section>
                <TextContainer>
                  <SkeletonDisplayText size="small" />
                  <SkeletonBodyText lines={2} />
                </TextContainer>
              </Card.Section>
              <Card.Section>
                <SkeletonBodyText lines={1} />
              </Card.Section>
            </Card>
            <Card subdued>
              <Card.Section>
                <TextContainer>
                  <SkeletonDisplayText size="small" />
                  <SkeletonBodyText lines={2} />
                </TextContainer>
              </Card.Section>
              <Card.Section>
                <SkeletonBodyText lines={2} />
              </Card.Section>
            </Card>
          </Layout.Section>
        </>
      ) : (
        props.children
      )}
    </>
  );
}
