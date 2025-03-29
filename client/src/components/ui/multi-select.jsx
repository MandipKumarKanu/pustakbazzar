"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options, groupBy) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption = {};
  options.forEach((option) => {
    const key = option[groupBy] || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption, picked) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption));

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value)
    );
  }
  return cloneOption;
}

function isOptionsExist(groupOption, targetOption) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true;
    }
  }
  return false;
}

const CommandEmpty = forwardRef(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn(
        "py-6 text-center text-sm italic text-muted-foreground",
        className
      )}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

const MultipleSelector = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    },
    ref
  ) => {
    const inputRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const dropdownRef = React.useRef(null);

    const [selected, setSelected] = React.useState(value || []);
    const [options, setOptions] = React.useState(
      transToGroupOption(arrayDefaultOptions, groupBy)
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected]
    );

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setOpen(false);
        inputRef.current.blur();
      }
    };

    const handleUnselect = React.useCallback(
      (option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    const handleKeyDown = React.useCallback(
      (e) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              if (!lastSelectOption.fixed) {
                handleUnselect(selected[selected.length - 1]);
              }
            }
          }
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      };
    }, [open]);

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

    useEffect(() => {
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };

      const exec = async () => {
        if (!onSearchSync || !open) return;

        if (triggerSearchOnFocus) {
          doSearchSync();
        }

        if (debouncedSearchTerm) {
          doSearchSync();
        }
      };

      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;

        if (triggerSearchOnFocus) {
          await doSearch();
        }

        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    const CreatableItem = () => {
      if (!creatable) return undefined;
      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined;
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={(value) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value, label: value }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          <Plus className="h-4 w-4" />
          {`Create "${inputValue}"`}
        </CommandItem>
      );

      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem
            value="-"
            disabled
            className="px-4 py-3 text-sm text-muted-foreground flex justify-center"
          >
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    const selectables = React.useMemo(
      () => removePickedOption(options, selected),
      [options, selected]
    );

    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      if (creatable) {
        return (value, search) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
        };
      }
      return undefined;
    }, [creatable, commandProps?.filter]);

    return (
      <Command
        ref={dropdownRef}
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          "h-auto overflow-visible bg-transparent",
          commandProps?.className
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch
        }
        filter={commandFilter()}
      >
        <div
          className={cn(
            "group min-h-12 rounded-xl border border-input bg-background text-base md:text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md",
            {
              "px-3 py-2": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
              "opacity-60": disabled,
            },
            className
          )}
          onClick={() => {
            if (disabled) return;
            inputRef?.current?.focus();
          }}
        >
          <div className="relative flex flex-wrap gap-1.5">
            <AnimatePresence>
              {selected.map((option) => {
                return (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      className={`${cn(
                        "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                        "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                        "py-1.5 px-3 rounded-lg font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                        badgeClassName
                      )} capitalize`}
                      data-fixed={option.fixed}
                      data-disabled={disabled || undefined}
                    >
                      {option.label}
                      <button
                        className={cn(
                          "ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          (disabled || option.fixed) && "hidden"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(option);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => handleUnselect(option)}
                      >
                        <X className="h-3 w-3 hover:text-destructive transition-colors" />
                      </button>
                    </Badge>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="flex flex-1 items-center">
              <CommandPrimitive.Input
                {...inputProps}
                ref={inputRef}
                value={inputValue}
                disabled={disabled}
                onValueChange={(value) => {
                  setInputValue(value);
                  inputProps?.onValueChange?.(value);
                }}
                onBlur={(event) => {
                  if (!onScrollbar) {
                    setOpen(false);
                  }
                  inputProps?.onBlur?.(event);
                }}
                onFocus={(event) => {
                  setOpen(true);
                  inputProps?.onFocus?.(event);
                }}
                placeholder={
                  hidePlaceholderWhenSelected && selected.length !== 0
                    ? ""
                    : placeholder
                }
                className={cn(
                  "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground",
                  {
                    "w-full": hidePlaceholderWhenSelected,
                    "px-3 py-3": selected.length === 0,
                    "ml-1": selected.length !== 0,
                  },
                  inputProps?.className
                )}
              />
              {open || inputValue ? (
                <X
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground/70 hover:text-muted-foreground cursor-pointer transition-colors mr-2",
                    (hideClearAllButton ||
                      disabled ||
                      selected.length < 1 ||
                      selected.filter((s) => s.fixed).length ===
                        selected.length) &&
                      "hidden"
                  )}
                  onClick={() => {
                    setInputValue("");
                    setSelected(selected.filter((s) => s.fixed));
                    onChange?.(selected.filter((s) => s.fixed));
                  }}
                />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity duration-200 mr-2" />
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1 z-10 w-full"
              >
                <CommandList
                  className="rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                  onMouseLeave={() => {
                    setOnScrollbar(false);
                  }}
                  onMouseEnter={() => {
                    setOnScrollbar(true);
                  }}
                  onMouseUp={() => {
                    inputRef?.current?.focus();
                  }}
                >
                  {isLoading ? (
                    <div className="py-6 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {loadingIndicator || "Loading..."}
                      </p>
                    </div>
                  ) : (
                    <>
                      {EmptyItem()}
                      {CreatableItem()}
                      {!selectFirstItem && (
                        <CommandItem value="-" className="hidden" />
                      )}
                      {Object.entries(selectables).map(([key, dropdowns]) => (
                        <CommandGroup
                          key={key}
                          heading={key}
                          className="h-full overflow-auto"
                        >
                          <div className={key ? "pt-1 pb-2" : ""}>
                            {key && (
                              <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {key}
                              </div>
                            )}
                            {dropdowns.map((option) => {
                              return (
                                <CommandItem
                                  key={option.value}
                                  value={option.label}
                                  disabled={option.disable}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onSelect={() => {
                                    if (selected.length >= maxSelected) {
                                      onMaxSelected?.(selected.length);
                                      return;
                                    }
                                    setInputValue("");
                                    const newOptions = [...selected, option];
                                    setSelected(newOptions);
                                    onChange?.(newOptions);
                                  }}
                                  className={`${cn(
                                    "cursor-pointer flex items-center justify-between text-sm px-4 py-2.5 mx-1 my-0.5 rounded-lg hover:bg-muted/50 aria-selected:bg-muted transition-colors",
                                    option.disable &&
                                      "cursor-default text-muted-foreground"
                                  )} capitalize`}
                                >
                                  <span>{option.label}</span>
                                  {selected.some(
                                    (item) => item.value === option.value
                                  ) && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </CommandItem>
                              );
                            })}
                          </div>
                        </CommandGroup>
                      ))}
                    </>
                  )}
                </CommandList>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Command>
    );
  }
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;
