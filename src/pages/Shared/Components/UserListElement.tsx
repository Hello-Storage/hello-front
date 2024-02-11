import { User } from "api";
import { useEffect, useState } from "react";

interface ListUserElementProps {
    user: User;
    handleRemoveEmail: (index: number) => void;
    index: number;

}

export function ListUserElement({ user, handleRemoveEmail, index }: ListUserElementProps) {
    // this is not important, i just wanted to add an animation
    const [aniClass, setaniClass] = useState<string>("")
    useEffect(() => {
        setTimeout(function () {
            setaniClass("show")
        }, 50);
    }, [])

    return (
        <div
            className={"px-2 py-1 m-1 rounded-full cursor-pointer hover:scale-110 list-user-element "+aniClass}
            style={{
                background:
                    user.color,
                color:
                    "white",
            }}
            onClick={() =>
                handleRemoveEmail(
                    index
                )
            }
        >
            {
                user.email
            }
        </div>
    )
}