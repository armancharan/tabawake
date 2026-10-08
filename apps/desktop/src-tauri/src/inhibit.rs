use std::sync::Mutex;

#[cfg(target_os = "macos")]
mod macos {
    use core_foundation::base::TCFType;
    use core_foundation::string::CFString;
    use std::os::raw::c_int;

    type IopmAssertionId = u32;

    const K_IOPM_ASSERTION_LEVEL_ON: u32 = 255;
    const K_IO_RETURN_SUCCESS: c_int = 0;

    #[link(name = "IOKit", kind = "framework")]
    extern "C" {
        fn IOPMAssertionCreateWithName(
            assertion_type: core_foundation::string::CFStringRef,
            assertion_level: u32,
            reason_string: core_foundation::string::CFStringRef,
            assertion_id: *mut IopmAssertionId,
        ) -> c_int;

        fn IOPMAssertionRelease(assertion_id: IopmAssertionId) -> c_int;
    }

    pub fn create() -> Result<u32, String> {
        let assertion_type = CFString::new("PreventUserIdleSystemSleep");
        let reason = CFString::new("tabawake system mode");
        let mut id: IopmAssertionId = 0;
        let status = unsafe {
            IOPMAssertionCreateWithName(
                assertion_type.as_concrete_TypeRef(),
                K_IOPM_ASSERTION_LEVEL_ON,
                reason.as_concrete_TypeRef(),
                &mut id,
            )
        };
        if status != K_IO_RETURN_SUCCESS {
            return Err(format!("IOPMAssertionCreateWithName failed ({status})"));
        }
        Ok(id)
    }

    pub fn release(id: u32) -> Result<(), String> {
        let status = unsafe { IOPMAssertionRelease(id) };
        if status != K_IO_RETURN_SUCCESS {
            return Err(format!("IOPMAssertionRelease failed ({status})"));
        }
        Ok(())
    }
}

pub struct InhibitState {
    id: Mutex<Option<u32>>,
}

impl InhibitState {
    pub fn new() -> Self {
        Self {
            id: Mutex::new(None),
        }
    }

    pub fn inhibit(&self) -> Result<(), String> {
        let mut guard = self
            .id
            .lock()
            .map_err(|_| "system inhibit lock poisoned".to_string())?;
        if guard.is_some() {
            return Ok(());
        }
        #[cfg(target_os = "macos")]
        {
            *guard = Some(macos::create()?);
            return Ok(());
        }
        #[cfg(not(target_os = "macos"))]
        {
            Err("System inhibit is macOS-only in this build.".into())
        }
    }

    pub fn release(&self) -> Result<(), String> {
        let mut guard = self
            .id
            .lock()
            .map_err(|_| "system inhibit lock poisoned".to_string())?;
        let Some(id) = guard.take() else {
            return Ok(());
        };
        #[cfg(target_os = "macos")]
        {
            return macos::release(id);
        }
        #[cfg(not(target_os = "macos"))]
        {
            let _ = id;
            Ok(())
        }
    }
}

impl Default for InhibitState {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for InhibitState {
    fn drop(&mut self) {
        let _ = self.release();
    }
}
