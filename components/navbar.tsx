import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "./logo";

function classNames(...classes: Array<string | boolean>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * make sure you are passing router.pathname and not
 * router.asPath since we want to have stripped any
 * fragments, query params, or trailing slashes
 */
const extractTabFromPath = (path: string) => {
  return path.split("/").pop() as string;
};

export type NavbarItem = {
  id: string;
  name: string;
  resource: string;
};

type NavbarProps = {
  accountId: string;
  appName: string;
  items: Array<NavbarItem>;
};

export default function Navbar({ items, accountId, appName }: NavbarProps) {
  const router = useRouter();
  const resourceId = router.query.id;
  const selected = extractTabFromPath(router.pathname);

  const selectedItemClass =
    "hover:cursor-pointer rounded-full bg-gray-900 px-3 py-2 text-lg font-medium text-white";
  const unselectedItemClass =
    "hover:cursor-pointer rounded-full px-3 py-2 text-lg font-medium text-gray-300 hover:bg-gray-700 hover:text-white";

  // Navigate to a resource sub-page:
  // /apps/:appId/settings
  // /accounts/:accountId/users
  const navigateTo = (item: NavbarItem) => {
    router.push(`/${item.resource}/${resourceId}/${item.id}`);
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="block h-8 w-auto lg:hidden mb-2">
                    <Logo />
                  </div>
                  <div className="hidden h-8 w-auto lg:block mb-2 hover:cursor-pointer">
                    <Logo />
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {items ? (
                      items.map((item) => {
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              navigateTo(item);
                            }}
                            className={
                              selected === item.id
                                ? selectedItemClass
                                : unselectedItemClass
                            }
                          >
                            {item.name}
                          </button>
                        );
                      })
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white"
                  >
                    <InformationCircleIcon
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </button>
                  <p className="text-white">{appName}</p>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div className="flex bg-gray-800 rounded-full items-center hover:ring-white hover:ring-2 hover:ring-offset-2 hover:ring-offset-gray-800 hover:outline-none hover:cursor-pointer">
                      <Menu.Button className="flex rounded-full text-sm">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full">
                          <Image
                            className="h-8 w-8 rounded-full"
                            src="/images/avatar.png"
                            alt="avatar placeholder"
                            height={32}
                            width={32}
                          />
                        </div>
                      </Menu.Button>
                      <ChevronDownIcon
                        className="ml-1 h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`/accounts/${accountId}`}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Your account
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="-mr-2 flex sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
