export const userSchema = `
  type User {
    id: Int!
    uuid: String!
    firstName: String
    lastName: String
    phoneNumber: String
    username: String!
    email: String!
    teams: [Team!]!
  }

  type Query {
    me: User!
    allUsers: [User!]!
    getUser(userId: Int!): User
    getUserByName(username: String!): User
    verifyUser(username: String): Boolean
    verifyEmail(email: String): Boolean
  }

  type RegisterResponse {
    ok: Boolean!
    user: User
    errors: [Error!]
  }

  type LoginResponse {
    ok: Boolean
    teamUUID: String
    channelUUID: String
    token: String
    refreshToken: String
    errors: [Error!]
  }

  type updateProfileResponse {
    ok: Boolean!
    errors: [Error!]    
  }

  type Mutation {
    register(firstName: String!, lastName: String!, phoneNumber: String!, username: String!, email: String!, password: String!): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
    updateProfile(id: Int!, username: String!, firstName: String, lastName: String, phoneNumber: String): updateProfileResponse!
  }
`;
