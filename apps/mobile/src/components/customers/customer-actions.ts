// apps/mobile/src/components/customers/customer-actions.ts
// Native device communication handlers for merchant-to-customer interactions

import { Linking, Alert, Platform } from "react-native";

/**
 * Initiates a native phone call to the customer
 */
export async function handleCallCustomer(phone: string | null | undefined, name?: string) {
  if (!phone || !phone.trim()) {
    Alert.alert("No Phone Number", `${name || "This customer"} does not have a phone number on file.`);
    return;
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const url = `tel:${cleanPhone}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported && Platform.OS !== "android") {
      Alert.alert("Unable to Call", "This device does not support outgoing phone calls.");
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Calling Error", `Could not launch phone dialer for ${phone}.`);
  }
}

/**
 * Opens the native email client addressed to the customer
 */
export async function handleEmailCustomer(email: string | null | undefined, name?: string) {
  if (!email || !email.trim()) {
    Alert.alert("No Email Address", `${name || "This customer"} does not have an email address on file.`);
    return;
  }

  const url = `mailto:${email.trim()}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported && Platform.OS !== "android") {
      Alert.alert("Unable to Email", "No email client is configured on this device.");
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Email Error", `Could not launch mail client for ${email}.`);
  }
}

/**
 * Opens WhatsApp conversation with customer
 * Strips formatting, handles regional phone numbers, never sends automated messages
 */
export async function handleWhatsAppCustomer(phone: string | null | undefined, name?: string) {
  if (!phone || !phone.trim()) {
    Alert.alert("No Phone Number", `${name || "This customer"} does not have a phone number for WhatsApp.`);
    return;
  }

  // Normalize phone number
  let clean = phone.replace(/[^0-9]/g, "");

  // If local 11-digit starting with 0 (e.g. India 08086202359), strip 0 and prepend country code 91
  if (clean.length === 11 && clean.startsWith("0")) {
    clean = "91" + clean.substring(1);
  } else if (clean.length === 10) {
    // Default 10 digits to Indian country code 91 if no code present
    clean = "91" + clean;
  }

  const url = `https://wa.me/${clean}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("WhatsApp Unavailable", "Could not open WhatsApp. Ensure WhatsApp is installed on your device.");
  }
}

