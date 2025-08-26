/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ChatGroupUser } from "@/app/(authenticated)/chat/types/types";
import { Button } from "@/components/ui/button";
import EmojiPickerComponent from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { ArrowUp, FileUp, X } from "lucide-react";

const ChatInput = ({
  inputRef,
  onChange,
  message,
  fileUpload,
  fileUploadLoading,
  repliedMessage,
  setRepliedMessage,
  onSubmit,
  showCommands,
  isGroup,
  filteredAgents,
  showUsers,
  filteredGroupUsers,
  handleCommands,
  fileInputRef,
  handleUserSelect,
  showForms,
  filteredForms,
  handleFormSelect,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  message: string;
  fileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileUploadLoading: boolean;
  repliedMessage: any;
  setRepliedMessage: React.Dispatch<any>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  showCommands: boolean;
  isGroup: boolean;
  filteredAgents: ChatGroupUser[] | undefined;
  showUsers: boolean;
  filteredGroupUsers: ChatGroupUser[] | undefined;
  handleCommands: (item: any) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUserSelect: (user: string) => void;
  showForms: boolean;
  filteredForms: ChatGroupUser[] | undefined;
  handleFormSelect: (form: string, user_id: number) => void;
}) => {
  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center h-full mt-5 justify-center"
      >
        <div className="mt-10 w-full">
          {repliedMessage && (
            <div className="text-muted-foreground flex items-center justify-between mb-2.5 bg-secondary/90 rounded-full w-full p-2">
              <span>{repliedMessage?.chat_message}</span>
              <X
                className="w-5 h-5 cursor-pointer"
                onClick={() => setRepliedMessage(null)}
              />
            </div>
          )}
          <div>
            {showCommands && isGroup && (
              <div className="bg-muted rounded-md p-2.5 mb-5">
                {filteredAgents &&
                  filteredAgents.map((item: any) => (
                    <div
                      key={item.user_catalog_id}
                      onClick={() => handleCommands(item)}
                    >
                      <p className="cursor-pointer">{item?.user_name}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div>
            {showUsers && isGroup && (
              <div className="bg-muted rounded-md p-2.5 mb-5">
                {filteredGroupUsers &&
                  filteredGroupUsers.map((user: any) => (
                    <div
                      key={user.user_catalog_id}
                      onClick={() => handleUserSelect(user?.user_name)}
                    >
                      <p className="cursor-pointer">{user?.user_name}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div>
            {showForms && isGroup && (
              <div className="bg-muted rounded-md p-2.5 mb-5">
                {filteredForms &&
                  filteredForms.map((user: any) => (
                    <div
                      key={user.user_catalog_id}
                      onClick={() =>
                        handleFormSelect(user?.user_name, user?.agent_uuid)
                      }
                    >
                      <p className="cursor-pointer">{user?.user_name}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground cursor-pointer">
              <EmojiPickerComponent />
            </span>
            <div className="border flex items-center rounded-full   p-2.5  w-full md:w-full">
              <Input
                placeholder="Type your message here..."
                className="bg-transparent border-none"
                value={message}
                ref={inputRef}
                // onChange={(e) => setMessage(e.target.value)}
                onChange={onChange}
              />
              <div className="flex justify-between items-center gap-2 ml-2">
                <div className="flex items-center gap-5 mr-3">
                  <span className="text-muted-foreground cursor-pointer">
                    <FileUp
                      className="w-5 h-5"
                      onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                      type="file"
                      accept=".pdf,.csv,,.docx,.xlsx,.ppt,.pptx, .txt,.wav,.mp3,.mp4,.mov,.wmv,.avi,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.mov,.wmv,.avi"
                      className="hidden"
                      onChange={fileUpload}
                      ref={fileInputRef}
                    />
                  </span>

                  <input type="file" className="hidden" />
                </div>
                <div>
                  <Button
                    disabled={!message || fileUploadLoading}
                    size="icon"
                    className="rounded-full"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
