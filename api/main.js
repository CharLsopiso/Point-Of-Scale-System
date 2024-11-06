"use client";

import { useSearchParam} from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const Main = () => {
    const searchParams = useSearchParam();
    const [contactsList, setContactsList] = useState([]);

    const fullName = searchParams.get("fullname");
    const userId = searchParams.get("userId");

    const getContacts = async () => {
        const url = "http://localhost/contacts-api/contacts.php";
        const jsonData = { userId: userId };

        const response = await axios.get(url,  {
            params: { json: JSON.stringify(jsonData), operation: "getContacts"},
        });

        setContactsList(response.data);
    };

    useEffect(() => {
        getContacts();
    }, []);

    return (
        <>
        <h1>Contact of {fullName}</h1>
        <table>
            <thead>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Actions</th>
            </thead>
        <tbody>
            {contactsList.map((contact, index) => {
                return (
                    <tr key={index}>
                        <td>{contact.contact_name}</td>
                        <td>{contact.contact_address}</td>
                        <td>{contact.contact_phone}</td>
                        <td>
                            <button>Update</button>
                            </td>
                    </tr>
                );
            })}
        </tbody>
        </table>
        </>
    );
};

export default Main;
