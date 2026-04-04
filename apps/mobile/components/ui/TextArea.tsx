import { forwardRef, type ReactNode, useState } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

interface TextAreaProps extends Omit<TextInputProps, "className" | "multiline"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  maxCharacters?: number;
  className?: string;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      maxCharacters,
      className = "",
      value,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const borderClass = error
      ? "border-error"
      : isFocused
        ? "border-primary"
        : "border-neutral-200";

    const characterCount = value?.length ?? 0;
    const isOverLimit = maxCharacters != null && characterCount > maxCharacters;

    return (
      <View className={className}>
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-neutral-700">
            {label}
          </Text>
        )}

        <View
          className={`rounded-button border bg-white px-3 py-2.5 ${borderClass}`}
        >
          {leftIcon && <View className="mb-2">{leftIcon}</View>}

          <TextInput
            ref={ref}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#8F8A84"
            value={value}
            onFocus={(e) => {
              setIsFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              rest.onBlur?.(e);
            }}
            className="text-base text-neutral-800"
            style={{ minHeight: 100 }}
            {...rest}
          />

          {rightIcon && <View className="mt-2 self-end">{rightIcon}</View>}
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          <View className="flex-1">
            {error && (
              <Text className="text-xs text-error">{error}</Text>
            )}

            {!error && helperText && (
              <Text className="text-xs text-neutral-400">{helperText}</Text>
            )}
          </View>

          {maxCharacters != null && (
            <Text
              className={`text-xs ${isOverLimit ? "text-error" : "text-neutral-400"}`}
            >
              {characterCount}/{maxCharacters}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

TextArea.displayName = "TextArea";
