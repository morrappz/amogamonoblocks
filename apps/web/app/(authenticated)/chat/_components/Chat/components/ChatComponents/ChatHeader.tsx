/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGroup } from "@/app/(authenticated)/chat/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Bot, History, Menu, Star } from "lucide-react";
import Link from "next/link";

const ChatHeader = ({
  isGroup,
  groupData,
}: {
  isGroup: boolean;
  groupData: ChatGroup | null;
}) => {
  return (
    <div>
      <div className="flex border-b border-gray-200 pb-5 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/chat">
            <h1 className="flex text-xl font-semibold items-center gap-2">
              <Bot className="w-5 h-5 text-muted-foreground" />
              {isGroup ? groupData?.chat_group_name : "Chat"}
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {groupData && (
              <div className="flex gap-4 items-center">
                <Avatar className="flex items-center justify-center bg-muted rounded-full h-10 w-10">
                  <AvatarImage
                    src={
                      groupData?.chat_group_users_json?.[0]
                        ?.profile_pic_url as string
                    }
                  />
                  <AvatarFallback>
                    {groupData?.chat_group_users_json?.[0]?.first_name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {groupData?.chat_group_users_json?.map(
                  (item: any, index: number) => (
                    <Avatar
                      key={index}
                      className="flex items-center justify-center bg-muted rounded-full h-10 w-10 -ml-2"
                    >
                      <AvatarImage src={item.profile_pic_url} />
                      <AvatarFallback>
                        {item?.first_name ? (
                          item?.first_name?.charAt(0).toUpperCase()
                        ) : (
                          <Bot className="w-5 h-5 text-muted-foreground" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-5">
          <Link href="/chat">
            <span className="text-muted-foreground cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </span>
          </Link>
          <span className="text-muted-foreground cursor-pointer">
            <History className="w-5 h-5" />
          </span>
          <span className="text-muted-foreground cursor-pointer">
            <Star className="w-5 h-5" />
          </span>
          <span className="text-muted-foreground cursor-pointer">
            <Menu className="w-5 h-5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
