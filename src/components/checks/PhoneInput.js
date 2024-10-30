import React from "react";
import BasePhoneInput from "react-phone-number-input";

export default function PhoneInput({ phone, phoneWarning, onBlur, onChange }) {
  return (
    <div id="phone-input-wrapper">
      <div className="label-wrapper">
        <label>Phone Number</label>
      </div>
      <BasePhoneInput
        id="phone"
        className={
          phoneWarning ? "PhoneInputInput PhoneWarning" : "PhoneInputInput"
        }
        // placeholder="Enter phone number"
        defaultCountry="US"
        value={phone}
        onChange={onChange}
        onBlur={onBlur}
      />
      {phoneWarning && <div className="error-label">{phoneWarning}</div>}
      <div className="help-label">
        We’ll use this phone number to send the ID check instructions to.
      </div>
    </div>
  );
}
