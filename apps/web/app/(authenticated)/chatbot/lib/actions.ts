"use server"

import { postgrest } from "@/lib/postgrest"

export async function fetchFormSetupData(text:string){
    try{
        const {data,error} = await postgrest.from("form_setup").select("*").ilike("form_name",`%${text}%`)
        if(error) throw error 
        return {data, success:true}
    }
    catch(error){
        throw error
    }
}