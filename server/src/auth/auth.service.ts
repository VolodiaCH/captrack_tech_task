import prisma from "../prisma/client.js";
import { OAuthProfile } from "./providers/types.js";
import { AuthProvider } from "@prisma/client";

export async function findOrCreateUser(profile: OAuthProfile) {
  return await prisma.$transaction(async (tx) => {
    const provider = profile.provider as AuthProvider;

    let user = await tx.user.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: profile.providerUserId,
        },
      },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          provider,
          providerUserId: profile.providerUserId,
          email: profile.email,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        },
      });

      // Create the default Uncategorized category
      await tx.category.create({
        data: {
          userId: user.id,
          name: "Uncategorized",
          isDefault: true,
        },
      });
    }

    return user;
  });
}
