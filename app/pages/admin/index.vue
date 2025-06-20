<template>
  <div class="container mx-auto mt-3 space-y-6 p-4 sm:space-y-8 sm:p-6">
    <!-- Header -->
    <div
      class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
    >
      <div class="flex-1">
        <h1 class="text-center text-2xl font-bold sm:text-3xl">
          Admin-Dashboard
        </h1>
        <p
          class="text-md mt-1 text-center text-gray-600 sm:mt-2 sm:text-base dark:text-gray-400"
        >
          Benutzer und Berechtigungen verwalten sowie Systemstatistiken anzeigen
        </p>
      </div>
      <div
        class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3"
      >
        <UButton
          icon="i-heroicons-arrow-path"
          variant="ghost"
          size="sm"
          class="sm:size-md"
          :loading="loadingStats"
          @click="refreshStats"
        >
          <span class="hidden sm:inline">Statistiken aktualisieren</span>
          <span class="sm:hidden">Aktualisieren</span>
        </UButton>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
      <UCard class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="sm:text-lx text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              Benutzer
            </p>
            <p class="text-xl font-bold sm:text-2xl">
              {{ stats?.overview?.users || 0 }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-users"
            class="h-6 w-6 text-blue-500 sm:h-8 sm:w-8"
          />
        </div>
      </UCard>

      <UCard class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="sm:text-lx text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              Artikel
            </p>
            <p class="text-xl font-bold sm:text-2xl">
              {{ stats?.overview?.articles || 0 }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-cube"
            class="h-6 w-6 text-green-500 sm:h-8 sm:w-8"
          />
        </div>
      </UCard>

      <UCard class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="sm:text-lx text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              Standorte
            </p>
            <p class="text-xl font-bold sm:text-2xl">
              {{ stats?.overview?.locations || 0 }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-map-pin"
            class="h-6 w-6 text-purple-500 sm:h-8 sm:w-8"
          />
        </div>
      </UCard>

      <UCard class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Projekte
            </p>
            <p class="text-xl font-bold sm:text-2xl">
              {{ stats?.overview?.projects || 0 }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-folder"
            class="h-6 w-6 text-orange-500 sm:h-8 sm:w-8"
          />
        </div>
      </UCard>
    </div>

    <!-- Detailed Article Statistics -->
    <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <UCard class="p-4 sm:p-6">
        <div class="space-y-3 sm:space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold sm:text-lg">Artikel Status</h3>
            <UIcon
              name="i-heroicons-chart-bar"
              class="h-5 w-5 text-gray-500 sm:h-6 sm:w-6"
            />
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-lg text-gray-600 dark:text-gray-400"
                >Im Lager</span
              >
              <div class="flex items-center space-x-2">
                <span class="font-semibold">{{
                  stats?.articles?.inStorage || 0
                }}</span>
                <UBadge color="info" variant="soft" size="lg">
                  {{
                    Math.round(
                      ((stats?.articles?.inStorage || 0) /
                        (stats?.articles?.total || 1)) *
                        100,
                    )
                  }}%
                </UBadge>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-lg text-gray-600 dark:text-gray-400"
                >Ausgeliehen</span
              >
              <div class="flex items-center space-x-2">
                <span class="font-semibold">{{
                  stats?.articles?.deployed || 0
                }}</span>
                <UBadge color="success" variant="soft" size="lg">
                  {{
                    Math.round(
                      ((stats?.articles?.deployed || 0) /
                        (stats?.articles?.total || 1)) *
                        100,
                    )
                  }}%
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="p-4 sm:p-6">
        <div class="space-y-3 sm:space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold sm:text-lg">Artikel nach Typ</h3>
            <UIcon
              name="i-heroicons-squares-2x2"
              class="h-5 w-5 text-gray-500 sm:h-6 sm:w-6"
            />
          </div>
          <div class="space-y-2">
            <div
              v-for="(count, type) in stats?.articles?.byType || {}"
              :key="type"
              class="flex items-center justify-between"
            >
              <span
                class="text-lg text-gray-600 capitalize dark:text-gray-400"
                >{{ type }}</span
              >
              <UBadge variant="soft" size="lg">{{ count }}</UBadge>
            </div>
            <div
              v-if="
                !stats?.articles?.byType ||
                Object.keys(stats.articles.byType).length === 0
              "
              class="text-lg text-gray-500 italic"
            >
              Keine Daten verfügbar
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <UCard v-if="stats?.activity?.recent?.length">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Letzte Aktivitäten</h2>
          <UBadge variant="soft" size="sm"
            >{{ stats.activity.recent.length }} Einträge</UBadge
          >
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-for="activity in stats.activity.recent.slice(0, 5)"
          :key="activity.id"
          class="border-default flex items-center justify-between rounded-lg border p-3"
        >
          <div class="flex items-center space-x-3">
            <UIcon
              :name="
                activity.action === 'taken_out'
                  ? 'ic:baseline-arrow-upward'
                  : 'ic:baseline-arrow-downward'
              "
              :class="
                activity.action === 'taken_out'
                  ? 'text-orange-500'
                  : 'text-green-500'
              "
              class="h-5 w-5"
            />
            <div>
              <p class="text-sm font-medium sm:text-xl">
                {{
                  activity.articleId
                    ? `${activity.articleId}`
                    : "Unbekannter Artikel"
                }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ activity.locationName }}
                <span v-if="activity.projectName">
                  • {{ activity.projectName }}</span
                >
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium sm:text-xl">
              {{ activity.userName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(activity.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Change Log Section -->
    <UCard v-if="stats?.changelog?.recent?.length">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold">Änderungsprotokoll</h2>
          <div class="flex items-center space-x-3">
            <UBadge
              v-for="(count, action) in stats.changelog.statistics"
              :key="action"
              variant="soft"
              size="sm"
              :color="getActionColor(action)"
            >
              {{ action }}: {{ count }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-for="change in stats.changelog.recent.slice(0, 5)"
          :key="change.id"
          class="border-default flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="showChangeDetails(change)"
        >
          <div class="flex items-center space-x-3">
            <UIcon
              :name="getActionIcon(change.action)"
              :class="getActionIconColor(change.action)"
              class="h-5 w-5"
            />
            <div>
              <p class="text-sm font-medium sm:text-xl">
                {{ change.action.toUpperCase() }}
                <span
                  v-if="change.articleId"
                  class="text-gray-600 dark:text-gray-400"
                >
                  • {{ change.articleId }}
                </span>
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                Klicken für Details
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium sm:text-xl">
              {{ change.userName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(change.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- User Management Section -->
    <UCard>
      <template #header>
        <div
          class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <h2 class="text-lg font-semibold sm:text-xl">Benutzerverwaltung</h2>
          <UButton
            icon="i-heroicons-arrow-path"
            variant="ghost"
            size="sm"
            class="self-start sm:self-auto"
            :loading="loadingUsers"
            @click="refreshUsers"
          >
            <span class="hidden sm:inline">Aktualisieren</span>
            <span class="sm:hidden">Refresh</span>
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Search Bar -->
        <UInput
          v-model="searchTerm"
          placeholder="Benutzer suchen..."
          icon="i-heroicons-magnifying-glass"
          class="w-full sm:max-w-sm"
        />

        <!-- Users Table -->
        <UTable
          :data="filteredUsers"
          :columns="userColumns"
          :loading="loadingUsers"
          class="w-full"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center space-x-3">
              <UAvatar
                :alt="`${row.original.firstName} ${row.original.lastName}`"
                size="sm"
              />
              <div>
                <p class="font-medium">
                  {{ row.original.firstName }} {{ row.original.lastName }}
                </p>
                <p class="text-lx text-gray-500">
                  {{ row.original.mail }}
                </p>
              </div>
            </div>
          </template>

          <template #jobtitle-cell="{ row }">
            <span class="text-md">{{ row.original.jobtitle || "N/A" }}</span>
          </template>

          <template #rights-cell="{ row }">
            <div class="flex flex-wrap gap-3">
              <UBadge
                v-for="right in row.original.rights"
                :key="right"
                :color="getRightColor(right)"
                variant="soft"
                size="md"
              >
                {{ formatRight(right) }}
              </UBadge>
            </div>
          </template>

          <template #webauthn-cell="{ row }">
            <UBadge
              :color="row.original.hasWebauthn ? 'success' : 'error'"
              variant="soft"
              size="md"
            >
              {{ row.original.hasWebauthn ? "Aktiviert" : "Deaktiviert" }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="getUserActions(row.original)">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal"
                size="sm"
              />
            </UDropdownMenu>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
  <!-- Edit User Modal -->
  <UModal
    v-model:open="showEditModal"
    prevent-close
    :title="`Benutzer bearbeiten: ${editingUser?.firstName} ${editingUser?.lastName}`"
    description="Benutzerberechtigungen und Zugriffsrechte ändern"
  >
    <template #content>
      <div class="flex max-h-[80vh] flex-col">
        <!-- Fixed Header Section -->
        <div
          class="flex-shrink-0 border-b border-gray-200 p-6 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="bg-primary-100 dark:bg-primary-900 flex h-10 w-10 items-center justify-center rounded-full"
              >
                <UIcon
                  name="i-heroicons-user-circle"
                  class="text-primary-600 dark:text-primary-400 h-6 w-6"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Benutzerberechtigungen bearbeiten
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ editingUser?.firstName }} {{ editingUser?.lastName }}
                </p>
              </div>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="sm"
              @click="closeEditModal"
            />
          </div>
        </div>

        <!-- Scrollable Content Section -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="editingUser" class="space-y-6">
            <!-- User Info Card -->
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div class="flex items-center space-x-3">
                <UAvatar
                  :alt="`${editingUser.firstName} ${editingUser.lastName}`"
                  size="md"
                />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ editingUser.firstName }} {{ editingUser.lastName }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ editingUser.mail }}
                  </p>
                  <p
                    v-if="editingUser.jobtitle"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ editingUser.jobtitle }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Rights Section -->
            <div class="space-y-4">
              <div>
                <label
                  class="mb-3 flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
                  <span>Benutzerberechtigungen</span>
                </label>
                <div class="space-y-3">
                  <div
                    v-for="right in availableRights"
                    :key="right"
                    class="group hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-600 dark:hover:bg-primary-900/20 relative rounded-lg border border-gray-200 p-4 transition-all dark:border-gray-700"
                    :class="{
                      'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20':
                        editingUser.rights.includes(right),
                    }"
                  >
                    <label class="flex cursor-pointer items-start space-x-3">
                      <UCheckbox
                        :model-value="editingUser.rights.includes(right)"
                        :color="
                          editingUser.rights.includes(right)
                            ? 'primary'
                            : 'neutral'
                        "
                        size="lg"
                        @update:model-value="
                          (checked: boolean | 'indeterminate') =>
                            toggleUserRight(right, checked as boolean)
                        "
                      />
                      <div class="flex-1">
                        <div class="flex items-center space-x-2">
                          <p class="font-medium text-gray-900 dark:text-white">
                            {{ formatRight(right) }}
                          </p>
                        </div>
                        <p
                          class="mt-1 text-sm text-gray-600 dark:text-gray-300"
                        >
                          {{ getRightDescription(right) }}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Section -->
        <div
          class="flex-shrink-0 border-t border-gray-200 p-6 dark:border-gray-700"
        >
          <div class="flex justify-end space-x-3">
            <UButton color="neutral" variant="soft" @click="closeEditModal">
              Abbrechen
            </UButton>
            <UButton
              :loading="savingUser"
              icon="i-heroicons-check"
              @click="saveUser"
            >
              Änderungen speichern
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Delete Confirmation Modal -->
  <UModal
    v-model:open="showDeleteModal"
    title="Benutzer löschen"
    description="Diese Aktion kann nicht rückgängig gemacht werden. Bitte bestätigen Sie, dass Sie diesen Benutzer löschen möchten."
  >
    <template #content>
      <div class="space-y-6 p-6">
        <!-- Header Section -->
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
        >
          <div class="flex items-center space-x-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
            >
              <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
                Benutzer löschen
              </h3>
              <p class="text-lx text-gray-500 dark:text-gray-400">
                Diese Aktion kann nicht rückgängig gemacht werden
              </p>
            </div>
          </div>
        </div>

        <!-- Warning Message -->
        <div
          class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
        >
          <div class="flex items-start space-x-3">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400"
            />
            <div>
              <h4 class="font-medium text-red-800 dark:text-red-300">
                Permanente Aktion
              </h4>
              <p class="text-lx mt-1 text-red-700 dark:text-red-200">
                Nach dem Löschen wird das Benutzerkonto und alle damit
                verbundenen Daten dauerhaft entfernt und kann nicht
                wiederhergestellt werden.
              </p>
            </div>
          </div>
        </div>

        <!-- User Info Card -->
        <div v-if="deletingUser" class="border-default rounded-md border p-3">
          <div class="flex items-center space-x-3">
            <UAvatar
              :alt="`${deletingUser.firstName} ${deletingUser.lastName}`"
              size="md"
            />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ deletingUser.firstName }} {{ deletingUser.lastName }}
              </p>
              <p class="text-lx text-gray-600 dark:text-gray-300">
                {{ deletingUser.mail }}
              </p>
              <p
                v-if="deletingUser.jobtitle"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                {{ deletingUser.jobtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700"
        >
          <UButton color="neutral" variant="soft" @click="closeDeleteModal">
            Abbrechen
          </UButton>
          <UButton
            color="error"
            :loading="deletingUserLoading"
            icon="i-heroicons-trash"
            @click="confirmDeleteUser"
          >
            Benutzer löschen
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Changelog Details Modal -->
  <UModal
    v-model:open="showChangelogModal"
    :title="`Änderungsdetails: ${selectedChange?.action?.toUpperCase() || 'N/A'}`"
    :description="`${selectedChange?.articleId ? 'Artikel: ' + selectedChange.articleId : 'System-Änderung'} • ${selectedChange ? formatDate(selectedChange.timestamp) : ''}`"
  >
    <template #content>
      <div class="flex max-h-[80vh] flex-col">
        <!-- Fixed Header Section -->
        <div
          class="flex-shrink-0 border-b border-gray-200 p-6 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full"
                :class="[
                  selectedChange?.action === 'create'
                    ? 'bg-green-100 dark:bg-green-900'
                    : selectedChange?.action === 'update'
                      ? 'bg-yellow-100 dark:bg-yellow-900'
                      : selectedChange?.action === 'delete'
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-gray-100 dark:bg-gray-900',
                ]"
              >
                <UIcon
                  :name="getActionIcon(selectedChange?.action || 'unknown')"
                  class="h-6 w-6"
                  :class="[
                    selectedChange?.action === 'create'
                      ? 'text-green-600 dark:text-green-400'
                      : selectedChange?.action === 'update'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : selectedChange?.action === 'delete'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400',
                  ]"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ selectedChange?.action?.toUpperCase() || "UNBEKANNT" }}
                  <span
                    v-if="selectedChange?.articleId"
                    class="text-gray-600 dark:text-gray-400"
                  >
                    • {{ selectedChange.articleId }}
                  </span>
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedChange?.userName || "System" }} •
                  {{
                    selectedChange ? formatDate(selectedChange.timestamp) : ""
                  }}
                </p>
              </div>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="sm"
              @click="closeChangelogModal"
            />
          </div>
        </div>

        <!-- Scrollable Content Section -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="selectedChange" class="space-y-6">
            <!-- Field-by-field changes for update actions -->
            <div
              v-if="
                selectedChange.action === 'update' &&
                (selectedChange.oldData || selectedChange.newData)
              "
            >
              <h4
                class="mb-4 text-base font-medium text-gray-900 dark:text-white"
              >
                Geänderte Felder
              </h4>
              <div class="space-y-3">
                <div
                  v-for="change in getFieldChanges(
                    selectedChange.oldData,
                    selectedChange.newData,
                  )"
                  :key="change.field"
                  class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div class="mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">{{
                      change.field
                    }}</span>
                  </div>
                  <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div>
                      <span
                        class="text-xs font-medium text-red-600 dark:text-red-400"
                        >Vorher:</span
                      >
                      <div
                        class="mt-1 rounded bg-red-50 p-2 dark:bg-red-900/20"
                      >
                        <code class="text-xs text-red-800 dark:text-red-200">
                          {{ formatChangeValue(change.oldValue) }}
                        </code>
                      </div>
                    </div>
                    <div>
                      <span
                        class="text-xs font-medium text-green-600 dark:text-green-400"
                        >Nachher:</span
                      >
                      <div
                        class="mt-1 rounded bg-green-50 p-2 dark:bg-green-900/20"
                      >
                        <code
                          class="text-xs text-green-800 dark:text-green-200"
                        >
                          {{ formatChangeValue(change.newValue) }}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="
                    getFieldChanges(
                      selectedChange.oldData,
                      selectedChange.newData,
                    ).length === 0
                  "
                >
                  <p class="text-sm text-gray-500 italic dark:text-gray-400">
                    Keine Änderungen erkannt
                  </p>
                </div>
              </div>
            </div>

            <!-- Article details for create/delete actions -->
            <div
              v-else-if="
                selectedChange.articleId &&
                (selectedChange.action === 'create' ||
                  selectedChange.action === 'delete')
              "
            >
              <div
                v-if="
                  selectedChange.action === 'create' && selectedChange.newData
                "
              >
                <h4
                  class="mb-4 text-base font-medium text-gray-900 dark:text-white"
                >
                  Erstellter Artikel
                </h4>
                <div
                  class="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-700 dark:bg-green-900/20"
                >
                  <ArticleInfoDisplay :article="selectedChange.newData" />
                </div>
              </div>

              <div
                v-else-if="
                  selectedChange.action === 'delete' && selectedChange.oldData
                "
              >
                <h4
                  class="mb-4 text-base font-medium text-gray-900 dark:text-white"
                >
                  Gelöschter Artikel
                </h4>
                <div
                  class="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-700 dark:bg-red-900/20"
                >
                  <ArticleInfoDisplay :article="selectedChange.oldData" />
                </div>
              </div>

              <!-- Fallback to raw data if article data is incomplete -->
              <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <!-- Old Data -->
                <div>
                  <h4
                    class="mb-3 flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-white"
                  >
                    <UIcon
                      name="i-heroicons-arrow-left"
                      class="h-4 w-4 text-red-500"
                    />
                    <span>Vorher</span>
                  </h4>
                  <div
                    class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <pre
                      v-if="selectedChange.oldData"
                      class="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                      >{{ formatChangeValue(selectedChange.oldData) }}</pre
                    >
                    <p
                      v-else
                      class="text-sm text-gray-500 italic dark:text-gray-400"
                    >
                      Keine vorherigen Daten
                    </p>
                  </div>
                </div>

                <!-- New Data -->
                <div>
                  <h4
                    class="mb-3 flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-white"
                  >
                    <UIcon
                      name="i-heroicons-arrow-right"
                      class="h-4 w-4 text-green-500"
                    />
                    <span>Nachher</span>
                  </h4>
                  <div
                    class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <pre
                      v-if="selectedChange.newData"
                      class="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                      >{{ formatChangeValue(selectedChange.newData) }}</pre
                    >
                    <p
                      v-else
                      class="text-sm text-gray-500 italic dark:text-gray-400"
                    >
                      Keine neuen Daten
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw data view for non-article changes or when field comparison is not applicable -->
            <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <!-- Old Data -->
              <div>
                <h4
                  class="mb-3 flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-white"
                >
                  <UIcon
                    name="i-heroicons-arrow-left"
                    class="h-4 w-4 text-red-500"
                  />
                  <span>Vorher</span>
                </h4>
                <div
                  class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <pre
                    v-if="selectedChange.oldData"
                    class="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                    >{{ formatChangeValue(selectedChange.oldData) }}</pre
                  >
                  <p
                    v-else
                    class="text-sm text-gray-500 italic dark:text-gray-400"
                  >
                    Keine vorherigen Daten
                  </p>
                </div>
              </div>

              <!-- New Data -->
              <div>
                <h4
                  class="mb-3 flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-white"
                >
                  <UIcon
                    name="i-heroicons-arrow-right"
                    class="h-4 w-4 text-green-500"
                  />
                  <span>Nachher</span>
                </h4>
                <div
                  class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <pre
                    v-if="selectedChange.newData"
                    class="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                    >{{ formatChangeValue(selectedChange.newData) }}</pre
                  >
                  <p
                    v-else
                    class="text-sm text-gray-500 italic dark:text-gray-400"
                  >
                    Keine neuen Daten
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Info -->
            <div
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <h4
                class="mb-3 text-base font-medium text-gray-900 dark:text-white"
              >
                Aktionsdetails
              </h4>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <span
                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >Aktion:</span
                  >
                  <UBadge
                    :color="getActionColor(selectedChange.action)"
                    variant="soft"
                    size="sm"
                    class="ml-2"
                  >
                    {{ selectedChange.action.toUpperCase() }}
                  </UBadge>
                </div>
                <div>
                  <span
                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >Benutzer:</span
                  >
                  <span class="ml-2 text-sm text-gray-900 dark:text-white">
                    {{ selectedChange.userName }}
                  </span>
                </div>
                <div v-if="selectedChange.articleId">
                  <span
                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >Artikel-ID:</span
                  >
                  <span
                    class="ml-2 font-mono text-sm text-gray-900 dark:text-white"
                  >
                    {{ selectedChange.articleId }}
                  </span>
                </div>
                <div>
                  <span
                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >Zeitstempel:</span
                  >
                  <span class="ml-2 text-sm text-gray-900 dark:text-white">
                    {{ formatDate(selectedChange.timestamp) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Section -->
        <div
          class="flex-shrink-0 border-t border-gray-200 p-6 dark:border-gray-700"
        >
          <div class="flex justify-end">
            <UButton
              color="neutral"
              variant="soft"
              @click="closeChangelogModal"
            >
              Schließen
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Rights, Right } from "@/composables/articles/types";
import type { TableColumn } from "#ui/types";
const { public: publicConfig } = useRuntimeConfig();

// Types
interface User {
  id: number;
  microsoftID: string;
  mail: string;
  firstName: string;
  lastName: string;
  jobtitle: string | null;
  rights: Rights;
  hasWebauthn: boolean;
  credentialCount: number;
}

interface Stats {
  overview: {
    articles: number;
    locations: number;
    projects: number;
    users: number;
    webauthnKeys: number;
  };
  articles: {
    total: number;
    inStorage: number;
    deployed: number;
    byType: Record<string, number>;
  };
  activity: {
    recent: Array<{
      id: number;
      articleId: number;
      locationName: string;
      projectName: string | null;
      userName: string;
      timestamp: number;
      action: "taken_out" | "returned";
    }>;
  };
  changelog: {
    statistics: Record<string, number>;
    recent: Array<{
      id: number;
      articleId: number | null;
      action: string;
      userName: string;
      timestamp: number;
      oldData: Record<string, unknown> | null;
      newData: Record<string, unknown> | null;
    }>;
  };
  system: {
    timestamp: number;
    uptime: number;
    nodeVersion: string;
    environment: string;
  };
}

// Reactive state
const toast = useToast();
const users = ref<User[]>([]);
const stats = ref<Stats | null>(null);
const loadingUsers = ref(false);
const loadingStats = ref(false);
const searchTerm = ref("");
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingUser = ref<User | null>(null);
const deletingUser = ref<User | null>(null);
const savingUser = ref(false);
const deletingUserLoading = ref(false);

// Changelog modal state
const showChangelogModal = ref(false);
const selectedChange = ref<Stats["changelog"]["recent"][0] | null>(null);

// Error handling for admin operations
async function showErrorToast(
  error: unknown,
  defaultTitle: string,
  defaultDescription: string,
) {
  const friendlyError = errorMap(error);

  // Check if this error requires logout
  if (friendlyError.requiresLogout) {
    // Clear the user session
    const { clear: logout } = useUserSession();
    await logout();

    // Show the error message
    toast.add({
      title: friendlyError.title || defaultTitle,
      description: friendlyError.description || defaultDescription,
      color: friendlyError.color || "warning",
      icon: friendlyError.icon || "ph:warning-circle",
    });

    // Navigate to login page
    await navigateTo("/login");
    return;
  }

  // Show the error message
  toast.add({
    title: friendlyError.title || defaultTitle,
    description: friendlyError.description || defaultDescription,
    color: friendlyError.color || "error",
    icon: friendlyError.icon || "ph:warning-circle",
  });
}

// Available rights for editing
const availableRights: Right[] = [
  "useArticles",
  "editArticles",
  "addArticles",
  "removeArticles",
  "admin",
];

// Computed properties
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value;

  const search = searchTerm.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search) ||
      user.lastName.toLowerCase().includes(search) ||
      user.mail.toLowerCase().includes(search) ||
      (user.jobtitle && user.jobtitle.toLowerCase().includes(search)),
  );
});

// Table columns configuration
const userColumns: TableColumn<User>[] = [
  {
    accessorKey: "firstName",
    header: "Name",
    id: "name",
  },
  {
    accessorKey: "jobtitle",
    header: "Berufsbezeichnung",
    id: "jobtitle",
  },
  {
    accessorKey: "rights",
    header: "Berechtigungen",
    id: "rights",
  },
  {
    accessorKey: "hasWebauthn",
    header: "WebAuthn",
    id: "webauthn",
  },
  {
    id: "actions",
    header: "Aktionen",
  },
];

// Helper functions
function getRightColor(right: Right) {
  const colors: Record<
    Right,
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
  > = {
    useArticles: "info",
    editArticles: "warning",
    addArticles: "success",
    removeArticles: "error",
    admin: "primary",
  };
  return colors[right] || "neutral";
}

function formatRight(right: Right): string {
  const labels: Record<Right, string> = {
    useArticles: "Artikel verwenden",
    editArticles: "Artikel bearbeiten",
    addArticles: "Artikel hinzufügen",
    removeArticles: "Artikel entfernen",
    admin: "Administrator",
  };
  return labels[right] || right;
}

function getRightDescription(right: Right): string {
  const descriptions: Record<Right, string> = {
    useArticles: "Kann Artikel anzeigen und durchsuchen",
    editArticles: "Kann bestehende Artikel ändern",
    addArticles: "Kann neue Artikel erstellen",
    removeArticles: "Kann Artikel löschen",
    admin: "Vollständiger administrativer Zugriff",
  };
  return descriptions[right] || "";
}

function toggleUserRight(right: Right, checked: boolean) {
  if (!editingUser.value) return;

  if (checked) {
    if (!editingUser.value.rights.includes(right)) {
      editingUser.value.rights.push(right);
    }
  } else {
    editingUser.value.rights = editingUser.value.rights.filter(
      (r) => r !== right,
    );
  }
}

function getUserActions(user: User) {
  return [
    [
      {
        label: "Berechtigungen bearbeiten",
        icon: "i-heroicons-pencil-square",
        onSelect: () => editUser(user),
      },
    ],
    [
      {
        label: "Benutzer löschen",
        icon: "i-heroicons-trash",
        onSelect: () => deleteUser(user),
      },
    ],
  ];
}

// Changelog helper functions
function getActionColor(
  action: string,
): "primary" | "success" | "warning" | "error" | "neutral" {
  const colors: Record<
    string,
    "primary" | "success" | "warning" | "error" | "neutral"
  > = {
    create: "success",
    update: "warning",
    delete: "error",
  };
  return colors[action] || "neutral";
}

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    create: "i-heroicons-plus-circle",
    update: "i-heroicons-pencil-square",
    delete: "i-heroicons-trash",
  };
  return icons[action] || "i-heroicons-information-circle";
}

function getActionIconColor(action: string): string {
  const colors: Record<string, string> = {
    create: "text-green-500",
    update: "text-yellow-500",
    delete: "text-red-500",
  };
  return colors[action] || "text-gray-500";
}

// Changelog modal functions
function showChangeDetails(change: Stats["changelog"]["recent"][0]) {
  selectedChange.value = change;
  showChangelogModal.value = true;
}

function closeChangelogModal() {
  showChangelogModal.value = false;
  selectedChange.value = null;
}

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function getFieldChanges(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
) {
  const changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }> = [];

  if (!oldData && !newData) return changes;

  const allKeys = new Set([
    ...(oldData ? Object.keys(oldData) : []),
    ...(newData ? Object.keys(newData) : []),
  ]);

  for (const key of allKeys) {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// API functions
async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const data = await $fetch<User[]>("/api/admin/users");
    users.value = data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    await showErrorToast(
      error,
      "Fehler beim Laden der Benutzer",
      "Die Benutzerliste konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    );
  } finally {
    loadingUsers.value = false;
  }
}

async function fetchStats() {
  loadingStats.value = true;
  try {
    const data = await $fetch<Stats>("/api/admin/stats");
    stats.value = data;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    await showErrorToast(
      error,
      "Fehler beim Laden der Statistiken",
      "Die Statistiken konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
    );
  } finally {
    loadingStats.value = false;
  }
}

async function refreshUsers() {
  await fetchUsers();
}

async function refreshStats() {
  await fetchStats();
}

// User management functions
function editUser(user: User) {
  editingUser.value = { ...user };
  showEditModal.value = true;
}

function deleteUser(user: User) {
  deletingUser.value = user;
  showDeleteModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editingUser.value = null;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deletingUser.value = null;
}

async function saveUser() {
  if (!editingUser.value) return;

  savingUser.value = true;
  // Store user info before potentially clearing it
  const userInfo = {
    firstName: editingUser.value.firstName,
    lastName: editingUser.value.lastName,
  };

  try {
    const response = await $fetch<{
      success: boolean;
      rightsChanged?: boolean;
    }>(`/api/admin/users/${editingUser.value.id}`, {
      method: "PUT",
      body: {
        rights: editingUser.value.rights,
      },
    });

    // Update local user data
    const index = users.value.findIndex((u) => u.id === editingUser.value!.id);
    if (index !== -1) {
      users.value[index] = { ...editingUser.value };
    }

    closeEditModal();

    // Show different message based on whether rights were changed
    if (response.rightsChanged) {
      toast.add({
        title: "Benutzer erfolgreich aktualisiert",
        description: `Die Berechtigungen für ${userInfo.firstName} ${userInfo.lastName} wurden geändert. Der Benutzer wird automatisch abgemeldet und muss sich erneut anmelden.`,
        color: "success",
        icon: "ph:user-check",
      });
    } else {
      toast.add({
        title: "Benutzer erfolgreich aktualisiert",
        description: `Die Daten für ${userInfo.firstName} ${userInfo.lastName} wurden erfolgreich geändert.`,
        color: "success",
        icon: "ph:user-check",
      });
    }
  } catch (error) {
    console.error("Failed to save user:", error);
    showErrorToast(
      error,
      "Fehler beim Aktualisieren des Benutzers",
      "Der Benutzer konnte nicht aktualisiert werden. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.",
    );

    // Refresh user data to ensure accuracy
    await fetchUsers();

    // Update modal data with current user information
    if (editingUser.value) {
      const currentUser = users.value.find(
        (u) => u.id === editingUser.value!.id,
      );
      if (currentUser) {
        editingUser.value = { ...currentUser };
      }
    }
  } finally {
    savingUser.value = false;
  }
}

async function confirmDeleteUser() {
  if (!deletingUser.value) return;

  deletingUserLoading.value = true;
  // Store user info before potentially clearing it
  const userInfo = {
    firstName: deletingUser.value.firstName,
    lastName: deletingUser.value.lastName,
  };

  try {
    await $fetch(`/api/admin/users/${deletingUser.value.id}`, {
      method: "DELETE",
    });

    // Remove user from local array
    users.value = users.value.filter((u) => u.id !== deletingUser.value!.id);

    closeDeleteModal();
    toast.add({
      title: "Benutzer erfolgreich gelöscht",
      description: `${userInfo.firstName} ${userInfo.lastName} wurde aus dem System entfernt.`,
      color: "success",
      icon: "ph:user-minus",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    showErrorToast(
      error,
      "Fehler beim Löschen des Benutzers",
      "Der Benutzer konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
    );

    // Refresh user data to ensure accuracy
    await fetchUsers();
  } finally {
    deletingUserLoading.value = false;
  }
}

// Initialize data on mount
onMounted(() => {
  fetchUsers();
  fetchStats();
  console.log("Public Config:", publicConfig);
  if (publicConfig.testLoginEnabled) {
    console.log("Test login is enabled");
  } else {
    console.log("Test login is disabled");
  }
});
</script>
