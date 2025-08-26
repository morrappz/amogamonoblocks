"use client"
import { Button } from "@/components/elements/Button";
import { useState } from "react";
import { Text } from "@/components/elements/Text";
import { secall } from "@/lib/server/server-actions";

export default function Index() {
	const [count, setCount] = useState(1)
	const [res, setRes] = useState("")

	const callback = async () => {
		const newcount = count + 1;
		setCount(newcount)
		await secall(newcount).then((r) => setRes(r))
	}
	return (
		<>
			<Button
				onPress={callback}
			>
				<Text>Press me</Text>
			</Button>

			<Button
				onPress={async () => {
					const res = await fetch("/api/sendemail")
					const resText = await res.text()
					console.log("res",res, resText)
				}}
			>
				<Text>Server api call</Text>
			</Button>

			<Text>{res}</Text>
		</>
	);
}
