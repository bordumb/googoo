import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Message } from "@googoo/shared";

import { MessageBubble } from "@/components/messages/MessageBubble";
import { Skeleton } from "@/components/ui";
import { useMessages } from "@/hooks/useMessages";
import { useServices } from "@/services/provider";
import { useAuthStore } from "@/stores/authStore";

export default function ConversationScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const currentUserId = useAuthStore((s) => s.session?.user.id);
  const { data: messages, isLoading } = useMessages(threadId);
  const { messages: messageService } = useServices();
  const queryClient = useQueryClient();

  // Poll for new messages (picks up auto-replies)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
    }, 2000);
    return () => clearInterval(interval);
  }, [threadId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.send(threadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
    },
  });

  const handleSend = useCallback(() => {
    if (inputText.trim().length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMutation.mutate(inputText.trim());
    setInputText("");
  }, [inputText, sendMutation]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isSent = item.sender_id === currentUserId;
      const reversedMessages = [...(messages ?? [])].reverse();
      const prevMsg = reversedMessages[index + 1];
      const showAvatar = !isSent && prevMsg?.sender_id !== item.sender_id;

      return (
        <MessageBubble
          content={item.content}
          isSent={isSent}
          showAvatar={showAvatar}
          isRead={item.read_at !== null}
          timestamp={item.created_at}
        />
      );
    },
    [currentUserId, messages],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            className={`mb-3 flex-row ${i % 2 === 0 ? "" : "justify-end"}`}
          >
            <Skeleton width={200} height={40} className="rounded-2xl" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={[...(messages ?? [])].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <View
        className="flex-row items-end border-t border-neutral-200 bg-white px-3 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <TextInput
          className="max-h-24 min-h-[40px] flex-1 rounded-full bg-neutral-50 px-4 py-2 text-base text-text"
          placeholder="Type a message..."
          placeholderTextColor="#B8B4AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={handleSend}
          disabled={inputText.trim().length === 0}
          className={`ml-2 mb-0.5 h-10 w-10 items-center justify-center rounded-full ${
            inputText.trim().length > 0 ? "bg-primary" : "bg-neutral-200"
          }`}
        >
          <Send
            size={18}
            color={inputText.trim().length > 0 ? "#fff" : "#B8B4AF"}
          />
        </Pressable>
      </View>
    </View>
  );
}
