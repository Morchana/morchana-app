# Morchana - หมอชนะ

[![Build Status](https://build.appcenter.ms/v0.1/apps/f8d0296f-daf0-4e4f-a167-c3aaf2fbf195/branches/staging/badge)](https://appcenter.ms/orgs/ThaiAlert.id/apps/ThaiAlert-Staging/build/branches/staging)

## Getting Started

#### Setup Dev Environments

There are 2 types of dev environments.

1. using Expo CLI
2. using React Native CLI In this project, we use the 2nd option.

To setup your dev environment, please follow **React Native CLI Quickstart**
instructions inside this page. https://reactnative.dev/docs/environment-setup

Make sure you can run the plain project on both iOS & Android with
`react-native init`

### Run iOS project

1. Clone `git clone https://govshare.data.go.th/morchana/morchana-app`
2. Install Dependencies `cd morchana-app && yarn && (cd ios; pod install)`
3. Open Xcode and then build with `iPhone SE (2nd generation)` simulator

### Run Android project

1. Clone `git clone https://govshare.data.go.th/morchana/morchana-app`
2. Install Dependencies `cd morchana-app && yarn`
3. Open an emulator with Android 9 from `Android Studio => ADV Manager`
4. Start `npx react-native run-android`

## App Flow

https://www.figma.com/file/lZx75oXlD92cikgSNNXvor/%E0%B8%AA%E0%B8%B9%E0%B9%89-Covid-19?node-id=5%3A366

![App Flow](screenshot.jpg 'AppFlow')
