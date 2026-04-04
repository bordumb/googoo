import { forwardRef, type ReactNode, useState } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, className = "", ...rest },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const borderClass = error
      ? "border-error"
      : isFocused
        ? "border-primary"
        : "border-neutral-200";

    return (
      <View className={className}>
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-neutral-700">
            {label}
          </Text>
        )}

        <View
          className={`flex-row items-center rounded-button border bg-white px-3 py-2.5 ${borderClass}`}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}

          <TextInput
            ref={ref}
            placeholderTextColor="#8F8A84"
            onFocus={(e) => {
              setIsFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              rest.onBlur?.(e);
            }}
            className="flex-1 text-base text-neutral-800"
            {...rest}
          />

          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>

        {error && (
          <Text className="mt-1 text-xs text-error">{error}</Text>
        )}

        {!error && helperText && (
          <Text className="mt-1 text-xs text-neutral-400">{helperText}</Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
