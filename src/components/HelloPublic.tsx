'use client'

import { useEffect, useState } from "react";
import { HelloPublicAPI } from "services/users";

export function HelloComponentPublic(){
  const [helloPublic, setHelloPublic] = useState<unknown>(null);
  
  useEffect(()=>{
    let active = true;
    HelloPublicAPI()
      .then((data) => {
        if (active) {
          setHelloPublic(data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      active = false;
    };
  },[])

  return (
    <div>
      <p className="mt-8 text-sm text-gray-500">
        API Test: {helloPublic ? (typeof helloPublic === 'object' ? JSON.stringify(helloPublic) : String(helloPublic)) : "Cargando..."}
      </p>
    </div>
  )
}