// UncontrolledLottie.jsx
import React, { Component } from "react";
import Lottie from "react-lottie";
import animationData from "assets/lottie_id_scan_animation.json";
import { Box } from "rebass";

function IdScanAnimation({ height = 150, width = 150 }) {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        width: "100%",
        // height: "100%"
      }}
    >
      <Lottie options={defaultOptions} height={height} width={width} />
    </Box>
  );
}

export default IdScanAnimation;
