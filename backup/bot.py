import os
import json
import datetime
from pathlib import Path
import discord
from discord import Intents
import aiohttp
from dotenv import load_dotenv

load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
VOUCH_CHANNEL_ID = 1402907215358070928

intents = Intents.default()
intents.message_content = True
intents.members = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"Bot logged in as {client.user}")

@client.event
async def on_message(message):

    if message.channel.id != VOUCH_CHANNEL_ID:
        return

    if message.author.bot:
        return

    content = message.content

    # -----------------------------
    # STORE ALL MENTIONED USERS
    # -----------------------------
    mentioned_users = []
    for mentioned_user in message.mentions:
        mentioned_users.append({
            "id": str(mentioned_user.id),
            "username": mentioned_user.name,
            "display_name": mentioned_user.display_name
        })

    vouch_data = {
        "username": message.author.name,
        "avatar": str(message.author.avatar.url if message.author.avatar else ""),
        "message": content,
        "timestamp": datetime.datetime.now().isoformat(),
        "receiver_id": str(message.mentions[0].id) if message.mentions else None,
        "receiver_username": message.mentions[0].name if message.mentions else None,
        "mentioned_users": mentioned_users
    }

    # -------------------------------------
    # SEND TO YOUR API SERVER ON RENDER
    # -------------------------------------
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://vouch-api-u8zv.onrender.com/vouch",
                json=vouch_data
            ) as resp:
                print("API Response:", await resp.text())
    except Exception as e:
        print("Error sending to API:", e)

    return

client.run(DISCORD_TOKEN)
