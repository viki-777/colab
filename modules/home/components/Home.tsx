import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";
import { useAuth } from "@/common/context/Auth.context";
import Header from "@/common/components/Header";

import NotFoundModal from "../modals/NotFound";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [roomId, setRoomId] = useState("");

  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Redirect to signin page instead of forcing Google auth
      router.push('/auth/signin');
      return;
    }

    if (isAuthenticated && user) {
      // If user is authenticated, redirect to dashboard
      router.push('/dashboard');
      return;
      socket.on("created", (roomIdFromServer) => {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      });

      const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
        if (!failed) {
          setAtomRoomId(roomIdFromServer);
          router.push(roomIdFromServer);
        } else {
          openModal(<NotFoundModal id={roomId} />);
        }
      };

      socket.on("joined", handleJoinedRoom);

      return () => {
        socket.off("created");
        socket.off("joined", handleJoinedRoom);
      };
    }
  }, [openModal, roomId, router, setAtomRoomId, isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (isAuthenticated) {
      socket.emit("leave_room");
      setAtomRoomId("");
    }
  }, [setAtomRoomId, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  const handleCreateRoom = () => {
    if (user) {
      socket.emit("create_room", {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
    }
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomId && user) {
      socket.emit("join_room", roomId, {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
    }
  };

  return (
    <>
      {/* <Header />
      <div className="flex flex-col items-center py-24">
        <h1 className="text-5xl font-extrabold leading-tight sm:text-extra">
          Colabio
        </h1>
        <h3 className="text-xl sm:text-2xl">Real-time whiteboard</h3>

        <div className="mt-10 flex flex-col gap-2">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            {user?.image && (
              <img
                src={user.image}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">Welcome, {user?.name}!</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="my-8 h-px w-96 bg-zinc-200" />

        <form
          className="flex flex-col items-center gap-3"
          onSubmit={handleJoinRoom}
        >
          <label htmlFor="room-id" className="self-start font-bold leading-tight">
            Enter room id
          </label>
          <input
            className="input"
            id="room-id"
            placeholder="Room id..."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="btn" type="submit">
            Join
          </button>
        </form>

        <div className="my-8 flex w-96 items-center gap-2">
          <div className="h-px w-full bg-zinc-200" />
          <p className="text-zinc-400">or</p>
          <div className="h-px w-full bg-zinc-200" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h5 className="self-start font-bold leading-tight">Create new room</h5>

          <button className="btn" onClick={handleCreateRoom}>
            Create
          </button>
        </div>
      </div> */}
    </>
  );
};

export default Home;

