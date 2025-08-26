/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  createGroup,
  updateGroupData,
} from "@/app/(authenticated)/chat/lib/actions";

const NewGroup = ({ isEdit, data }: { isEdit?: boolean; data?: any }) => {
  const [groupName, setGroupName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (data) {
      setGroupName(data?.chat_group_name);
      setStatus(data?.status);
    }
  }, [data]);

  const handleSave = async () => {
    if (!groupName) return;
    try {
      setLoading(true);
      const payload = {
        chat_group_name: groupName,
        status: status,
        created_user_id: session?.user?.user_catalog_id,
        created_user_name: session?.user?.user_name,
        business_number: session?.user?.business_number,
        business_name: session?.user?.business_name,
        created_at_datetime: new Date().toISOString(),
      };
      if (isEdit && data) {
        // response = await axiosInstance.patch(
        //   `${CHAT_GROUP_API}?chat_group_id=eq.${data.chat_group_id}`,
        //   payload
        // );
        await updateGroupData(data.chat_group_id, payload);
        toast.success("Group updated successfully");
      } else {
        await createGroup(payload);
        toast.success("Group created successfully");
      }
      setLoading(false);
      setGroupName("");
      setStatus("");

      // if (response.status === 204) {
      //   toast.success("Group updated successfully");
      // }
    } catch (error) {
      setLoading(false);
      setGroupName("");
      setStatus("");
      toast.error(`Error creating group: ${error}`);
    }
  };

  return (
    <div>
      <Card>
        <CardContent>
          <div className="flex items-center w-full mt-5 justify-between">
            <h1 className="text-xl font-semibold">Create New Group</h1>
            <Link href={"/chat"}>
              <Button className="border-0" variant={"outline"}>
                Back to Group
              </Button>
            </Link>
          </div>
          <div className="mt-5">
            <Label htmlFor="group_name">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="group_name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
            />
          </div>
          <div className="mt-5">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-end w-full gap-2">
            <Link href={"/chat"}>
              <Button variant={"outline"}>Cancel</Button>
            </Link>
            <Button disabled={!groupName || loading} onClick={handleSave}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewGroup;
