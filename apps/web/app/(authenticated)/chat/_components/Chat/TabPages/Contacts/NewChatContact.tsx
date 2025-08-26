/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { countries, states } from "@/lib/country-state-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { createUser, updateUser } from "../../../../lib/actions";

const NewChatContact = ({
  data,
  isEdit = false,
  isView = false,
}: {
  data?: any;
  isEdit?: boolean;
  isView?: boolean;
}) => {
  const router = useRouter();
  const [availableStates, setAvailableStates] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    fullName: "",
    businessName: "",
    businessNumber: "",
    designation: "",
    department: "",
    email: "",
    mobile: "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    zipcode: "",
    mapLink: "",
    roles: "",
    status: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: data.user_name,
        businessName: data.business_name,
        businessNumber: data.business_number,
        designation: data.designation,
        department: data.department,
        email: data.user_email,
        mobile: data.user_mobile,
        address1: data.business_address_1,
        address2: data.business_address_2,
        country: data.business_country,
        state: data.business_state,
        zipcode: data.business_postcode,
        mapLink: data.geo_map_url,
        roles: data.roles,
        status: data.status,
      });
    }
  }, [data]);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (c) => c.name === formData.country
      );
      if (selectedCountry) {
        const countryStates = states[selectedCountry.code] || [];
        setAvailableStates(countryStates);
      } else {
        setAvailableStates([]);
      }
    }
  }, [formData.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName || formData.firstName.trim() === "") {
      newErrors.firstName = "Required";
    }
    if (!formData.lastName || formData.lastName.trim() === "") {
      newErrors.lastName = "Required";
    }
    if (!formData.mobile || formData.mobile.trim() === "") {
      newErrors.mobile = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      user_name: formData.fullName,
      business_name: formData.businessName,
      business_number: formData.businessNumber,
      designation: formData.designation,
      department: formData.department,
      user_email: formData.email,
      user_mobile: formData.mobile,
      business_address_1: formData.address1,
      business_address_2: formData.address2,
      business_country: formData.country,
      business_state: formData.state,
      business_postcode: formData.zipcode,
      geo_map_url: formData.mapLink,
      roles: formData.roles,
      status: formData.status,
    };
    // const response = await fetch(
    //   isEdit
    //     ? `${GET_CONTACTS_API}?user_catalog_id=eq.${data.user_catalog_id}`
    //     : GET_CONTACTS_API,
    //   {
    //     method: isEdit ? "PATCH" : "POST",
    //     headers: {
    //       "Content-Type": "application/json",

    //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    //     },
    //     body: JSON.stringify(payload),
    //   }
    // );
    const response = isEdit
      ? updateUser(payload, data.user_catalog_id)
      : createUser(payload);
    if (response) {
      setIsLoading(false);
      toast.success(
        isEdit ? "Contact updated successfully" : "Contact created successfully"
      );

      // setFormData({
      //   firstName: "",
      //   lastName: "",
      //   fullName: "",
      //   businessName: "",
      //   businessNumber: "",
      //   designation: "",
      //   department: "",
      //   email: "",
      //   mobile: "",
      //   address1: "",
      //   address2: "",
      //   country: "",
      //   state: "",
      //   zipcode: "",
      //   mapLink: "",
      //   roles: "",
      //   status: "",
      // });
      router.push("/chat");
    } else {
      setIsLoading(false);
      toast.error(
        isEdit ? "Failed to updated contact" : "Failed to create contact"
      );
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "country") {
      const selectedCountry = countries.find((c) => c.code === value);
      setFormData((prev) => ({
        ...prev,
        [field]: selectedCountry?.name || "",
        state: "", // Reset state when country changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  return (
    <div className="w-full max-w-[800px]  mx-auto md:p-4 p-2">
      <Card className="border-0 p-0 m-0 md:border md:p-2 md:m-4">
        <CardContent className="px-1.5 py-1.5">
          <div className="flex justify-between mb-6 items-center">
            <h1 className="text-2xl font-bold">
              {isEdit
                ? "Edit Contact"
                : isView
                ? "View Contact"
                : "Add New Contact"}
            </h1>
            <Link href="/chat">
              <Button variant={"outline"} className="border-0">
                Back to Contacts
              </Button>
            </Link>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName}</p>
                  )}
                </div>
                <Input
                  id="firstName"
                  placeholder="Enter First Name"
                  readOnly={isView}
                  onChange={handleChange}
                  value={formData.firstName}
                  className={errors.firstName ? "border-red-500" : ""}
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName}</p>
                  )}
                </div>
                <Input
                  id="lastName"
                  readOnly={isView}
                  placeholder="Enter Last Name"
                  onChange={handleChange}
                  value={formData.lastName}
                  className={errors.lastName ? "border-red-500" : ""}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="fullName">Full Name</Label>
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName}</p>
                )}
              </div>
              <Input
                id="fullName"
                placeholder="Enter Full Name"
                readOnly={isView}
                onChange={handleChange}
                value={formData.fullName}
                className={errors.fullName ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="businessName">Business Name</Label>
                {errors.businessName && (
                  <p className="text-red-500 text-sm">{errors.businessName}</p>
                )}
              </div>

              <Input
                id="businessName"
                placeholder="Enter Business Name"
                readOnly={isView}
                onChange={handleChange}
                value={formData.businessName}
                className={errors.businessName ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="businessNumber">Business Number</Label>
                {errors.businessNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.businessNumber}
                  </p>
                )}
              </div>
              <Input
                id="businessNumber"
                placeholder="Enter Business Number"
                readOnly={isView}
                onChange={handleChange}
                value={formData.businessNumber}
                className={errors.businessNumber ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="designation">Designation</Label>
                {errors.designation && (
                  <p className="text-red-500 text-sm">{errors.designation}</p>
                )}
              </div>
              <Input
                id="designation"
                placeholder="Enter Designation"
                readOnly={isView}
                onChange={handleChange}
                value={formData.designation}
                className={errors.designation ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="department">Department</Label>
                {errors.department && (
                  <p className="text-red-500 text-sm">{errors.department}</p>
                )}
              </div>
              <Input
                id="department"
                readOnly={isView}
                placeholder="Enter Department"
                onChange={handleChange}
                value={formData.department}
                className={errors.department ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="email">Email</Label>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <Input
                type="email"
                id="email"
                readOnly={isView}
                placeholder="Enter Email"
                onChange={handleChange}
                value={formData.email}
                className={errors.email ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="mobile">
                  Mobile <span className="text-red-500">*</span>
                </Label>
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>

              <Input
                type="number"
                id="mobile"
                readOnly={isView}
                placeholder="Enter Mobile"
                onChange={handleChange}
                value={formData.mobile}
                className={errors.mobile ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="address1">Address 1</Label>
                {errors.address1 && (
                  <p className="text-red-500 text-sm">{errors.address1}</p>
                )}
              </div>
              <Input
                id="address1"
                readOnly={isView}
                placeholder="Enter Address 1"
                onChange={handleChange}
                value={formData.address1}
                className={errors.address1 ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="address2">Address 2</Label>
                {errors.address2 && (
                  <p className="text-red-500 text-sm">{errors.address2}</p>
                )}
              </div>

              <Input
                id="address2"
                readOnly={isView}
                placeholder="Enter Address 2"
                onChange={handleChange}
                value={formData.address2}
                className={errors.address2 ? "border-red-500" : ""}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between">
                  <Label htmlFor="country">Country</Label>
                  {errors.country && (
                    <p className="text-red-500 text-sm">{errors.country}</p>
                  )}
                </div>
                <Select
                  disabled={isView}
                  value={
                    countries.find((c) => c.name === formData.country)?.code ||
                    ""
                  }
                  onValueChange={(value) =>
                    handleSelectChange(value, "country")
                  }
                >
                  <SelectTrigger
                    className={errors.country ? "border-red-500" : ""}
                    id="country"
                  >
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between">
                  <Label htmlFor="state">State</Label>
                  {errors.state && (
                    <p className="text-red-500 text-sm">{errors.state}</p>
                  )}
                </div>

                <Select
                  value={formData.state}
                  onValueChange={(value) => handleSelectChange(value, "state")}
                  disabled={!formData.country || isView}
                >
                  <SelectTrigger
                    className={errors.state ? "border-red-500" : ""}
                    id="state"
                  >
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="zipcode">Zipcode</Label>
                {errors.zipcode && (
                  <p className="text-red-500 text-sm">{errors.zipcode}</p>
                )}
              </div>

              <Input
                id="zipcode"
                readOnly={isView}
                placeholder="Enter Zipcode"
                onChange={handleChange}
                value={formData.zipcode}
                className={errors.zipcode ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="mapLink">Map Link</Label>
                {errors.mapLink && (
                  <p className="text-red-500 text-sm">{errors.mapLink}</p>
                )}
              </div>

              <Input
                id="mapLink"
                readOnly={isView}
                placeholder="Enter Map Link"
                onChange={handleChange}
                value={formData.mapLink}
                className={errors.mapLink ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="roles">Roles</Label>
                {errors.roles && (
                  <p className="text-red-500 text-sm">{errors.roles}</p>
                )}
              </div>
              <Input
                id="roles"
                placeholder="Enter Roles"
                readOnly={isView}
                onChange={handleChange}
                value={formData.roles}
                className={errors.roles ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="status">Status</Label>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status}</p>
                )}
              </div>
              <Select
                disabled={isView}
                value={formData.status}
                onValueChange={(value) => handleSelectChange(value, "status")}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                  id="status"
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isView && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/chat")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewChatContact;
