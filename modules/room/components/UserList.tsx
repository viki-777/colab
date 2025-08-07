import { useRoom } from "@/common/recoil/room";

const UserList = () => {
  const { users } = useRoom();

  return (
    <div className="pointer-events-none absolute z-30 flex p-2 sm:p-5 mt-12 sm:mt-16">
      {[...users.keys()].slice(0, window.innerWidth < 640 ? 3 : 8).map((userId, index) => {
        const user = users.get(userId);
        return (
          <div
            key={userId}
            className="relative flex h-8 w-8 sm:h-12 sm:w-12 select-none items-center justify-center rounded-full text-xs text-white border-1 sm:border-2 border-white dark:border-gray-300 shadow-lg"
            style={{
              marginLeft: index !== 0 ? (window.innerWidth < 640 ? "-0.3rem" : "-0.5rem") : 0,
            }}
            title={`${user?.name} (${user?.email})`}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div 
                className="h-full w-full rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm"
                style={{ backgroundColor: user?.color || "black" }}
              >
                {user?.name?.split("")[0]?.toUpperCase() || "A"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
