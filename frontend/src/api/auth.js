const roles = {
    0: "GUSET",
    2: "USER",
    3: "MANAGER",
}

const users = [
    {
        id: 1,
        login: "user1",
        password:"user1",
        roleID: 1,
    },
    {
        id: 2,
        login: "manager1",
        password:"manager1",
        roleID: 2,
    },

]
export async function login() {
    const user = users.find((u) => u.login === login && u.password === password)
    if (user) {
        const {password, ...dtoUser} = user;
        dtoUser.role = roles[dtoUser.roleID];
        return Promise.resolve(dtoUser);
    }
    return Promise.reject("user not found pr wrong password")
}