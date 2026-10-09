import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { customerApi } from "@/lib/customerApi"

// Logowanie hasłem sprawdza hasło w Magento po stronie serwera (login.php + token zaufania).
// Identyfikator klienta w sesji pochodzi z odpowiedzi Magento — nigdy z danych wysłanych przez przeglądarkę.
export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Apple({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Hasło", type: "password" },
            },
            async authorize(credentials) {
                const email = String(credentials?.email ?? "").trim()
                const password = String(credentials?.password ?? "")
                if (!email || !password) return null

                try {
                    const result = await customerApi("user/login.php", { email, password })
                    const customer = result.data?.customer
                    if (!result.success || !customer?.id) return null

                    return {
                        id: String(customer.id),
                        email: customer.email,
                        name: customer.firstname,
                    }
                } catch (error) {
                    console.error("[auth] Credentials login failed:", error)
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "credentials") return true

            // Google potwierdza własność adresu — bez tego ktoś mógłby przejąć cudze konto, podając cudzy e-mail
            if (account?.provider === "google" && profile?.email_verified === false) return false
            if (!user.email) return false

            try {
                const result = await customerApi("user/login.php", {
                    email: user.email,
                    name: user.name,
                    nextauth: true,
                    provider: account?.provider,
                    providerId: account?.providerAccountId,
                })
                const customer = result.data?.customer
                if (!result.success || !customer?.id) return false

                // identyfikator Magento zastępuje identyfikator dostawcy (trafi do tokenu w callbacku jwt)
                user.id = String(customer.id)
                user.name = customer.firstname
                return true
            } catch (error) {
                console.error("[auth] OAuth backend sync error:", error)
                return false
            }
        },
        async jwt({ token, user }) {
            if (user?.id) token.uid = user.id
            return token
        },
        async session({ session, token }) {
            const uid = typeof token.uid === "string" ? token.uid : token.sub
            if (uid) session.user.id = uid
            return session
        },
    },
})
