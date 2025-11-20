import { useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string; // ví dụ: "form__group" để giữ style sẵn có
  inputClassName?: string; // ví dụ: "form__input" nếu bạn có
};

export default function PasswordField({
  value,
  onChange,
  placeholder = " ",
  label = "Mật khẩu",
  name = "password",
  autoComplete = "current-password",
  required = true,
  className = "form__group",
  inputClassName = "",
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className={className} style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={inputClassName}
        style={{ paddingRight: 42 }} // chừa chỗ cho nút con mắt
      />
      {/* Label kiểu form của bạn */}
      <label>{label}</label>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="pw-eye-btn"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 6,
          lineHeight: 0,
        }}
      >
        {show ? (
          // icon "eye-off"
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 640 640"
            fill="currentColor"
          >
            <path d="M38.8 75.7c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64C22.2 222.3 0 268 0 320c0 35.3 83.9 192 320 192 66.3 0 121.6-12.1 166.4-31.4l59.7 59.7c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-576-576zM320 448c-70.7 0-128-57.3-128-128 0-20.7 5-40.3 13.7-57.5l171.8 171.8C360.3 442.9 340.7 448 320 448zm160-128c0 17.1-3.2 33.5-9.1 48.6l99.4 99.4C607.7 435.2 640 368.9 640 320c0-35.3-83.9-192-320-192-49 0-91.6 6.6-128.4 17.8l88.1 88.1C293.7 226.2 306.6 224 320 224c70.7 0 128 57.3 128 128z" />
          </svg>
        ) : (
          // icon "eye"
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 640 640"
            fill="currentColor"
          >
            <path d="M320 128C83.9 128 0 284.7 0 320s83.9 192 320 192 320-156.7 320-192-83.9-192-320-192zm0 320c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128zm0-208c-44.1 0-80 35.9-80 80 0 3.2.2 6.3.6 9.4 24.7 9.9 52.1 5.7 71.7-13.9 19.6-19.6 23.8-47 13.9-71.7-3.1-.4-6.2-.6-9.4-.6z" />
          </svg>
        )}
      </button>
      {/* message lỗi nếu cần:
      <p className="form__message">Mật khẩu là bắt buộc</p> */}
    </div>
  );
}
